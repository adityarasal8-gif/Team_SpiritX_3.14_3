"""
Prediction Service - Time Series Forecasting with Prophet

This module implements bed occupancy prediction using Facebook Prophet.

WHY PROPHET?
- Designed specifically for time-series forecasting with daily data
- Handles seasonality automatically (weekly patterns in hospital admissions)
- Robust to missing data and outliers (common in healthcare data)
- Provides confidence intervals for predictions
- Simple to explain to non-technical stakeholders
- Fast training and prediction (important for real-time dashboards)
- Better than LSTM for smaller datasets (typical in hackathons)

Prophet Model Components:
- Trend: Overall increase/decrease in bed occupancy
- Seasonality: Weekly patterns (e.g., lower admissions on weekends)
- Holidays: Can be extended to include holidays (future enhancement)
"""

import pandas as pd
import numpy as np
from prophet import Prophet
from datetime import datetime, timedelta
from typing import List, Dict, Tuple
import warnings

# Suppress Prophet's verbose output
warnings.filterwarnings('ignore')


class PredictionService:
    """
    Service for predicting hospital bed occupancy using Prophet
    """
    
    def __init__(self):
        """Initialize prediction service"""
        self.model = None
        self.trained = False
    
    def prepare_data(self, ehr_records: List) -> pd.DataFrame:
        """
        Prepare EHR data for Prophet training
        
        Prophet requires specific column names:
        - 'ds': date column
        - 'y': value to predict (occupied_beds)
        
        Args:
            ehr_records: List of EHR records from database
            
        Returns:
            DataFrame with 'ds' and 'y' columns
        """
        # Convert to DataFrame
        data = pd.DataFrame([
            {
                'ds': record.date,
                'y': record.occupied_beds
            }
            for record in ehr_records
        ])
        
        # Sort by date
        data = data.sort_values('ds').reset_index(drop=True)
        
        return data
    
    def train_model(self, historical_data: pd.DataFrame) -> Dict:
        """
        Train Prophet model on historical bed occupancy data
        
        Args:
            historical_data: DataFrame with 'ds' and 'y' columns
            
        Returns:
            Dictionary with training metadata
        """
        # Initialize Prophet model
        # Parameters explained:
        # - daily_seasonality: Capture daily patterns (not needed for daily aggregated data)
        # - weekly_seasonality: Capture weekly patterns (e.g., weekend effects)
        # - yearly_seasonality: Capture seasonal patterns (if enough data)
        # - changepoint_prior_scale: Control trend flexibility (0.05 is conservative)
        self.model = Prophet(
            daily_seasonality=False,
            weekly_seasonality=True,
            yearly_seasonality='auto',
            changepoint_prior_scale=0.05,
            interval_width=0.95  # 95% confidence interval
        )
        
        # Train the model
        self.model.fit(historical_data)
        self.trained = True
        
        # Return training metadata
        return {
            'model': 'Prophet',
            'training_samples': len(historical_data),
            'date_range': {
                'start': historical_data['ds'].min().isoformat(),
                'end': historical_data['ds'].max().isoformat()
            },
            'trained_at': datetime.utcnow().isoformat()
        }
    
    def predict(self, days: int = 7) -> pd.DataFrame:
        """
        Generate predictions for future days
        
        Args:
            days: Number of days to predict (default 7)
            
        Returns:
            DataFrame with predictions including confidence bounds
        """
        if not self.trained or self.model is None:
            raise ValueError("Model must be trained before making predictions")
        
        # Create future dataframe
        future = self.model.make_future_dataframe(periods=days)
        
        # Generate predictions
        forecast = self.model.predict(future)
        
        # Return only future predictions
        return forecast.tail(days)
    
    def predict_occupancy(
        self,
        ehr_records: List,
        days: int = 7
    ) -> Tuple[List[Dict], Dict]:
        """
        Complete prediction pipeline: prepare data, train model, predict
        
        Args:
            ehr_records: Historical EHR records from database
            days: Number of days to predict
            
        Returns:
            Tuple of (predictions list, model metadata)
        """
        # Validate minimum data requirement
        if len(ehr_records) < 14:
            raise ValueError("Need at least 14 days of historical data for reliable predictions")
        
        # Prepare data
        historical_data = self.prepare_data(ehr_records)
        
        # Train model
        model_info = self.train_model(historical_data)
        
        # Generate predictions
        forecast = self.predict(days)
        
        # Format predictions
        predictions = []
        for _, row in forecast.iterrows():
            predictions.append({
                'date': row['ds'].date(),
                'predicted_occupancy': max(0, round(row['yhat'])),  # Ensure non-negative
                'lower_bound': max(0, round(row['yhat_lower'])),
                'upper_bound': max(0, round(row['yhat_upper']))
            })
        
        return predictions, model_info
    
    def calculate_risk_level(self, predicted_occupancy: float, total_beds: int) -> str:
        """
        Calculate risk level based on predicted occupancy
        
        Risk categories:
        - Green: < 70% (safe)
        - Yellow: 70-85% (caution)
        - Red: > 85% (critical)
        
        Args:
            predicted_occupancy: Predicted number of occupied beds
            total_beds: Total bed capacity
            
        Returns:
            Risk level: 'green', 'yellow', or 'red'
        """
        if total_beds == 0:
            return 'green'
        
        utilization = (predicted_occupancy / total_beds) * 100
        
        if utilization < 70:
            return 'green'
        elif utilization < 85:
            return 'yellow'
        else:
            return 'red'
    
    def generate_alerts(
        self,
        predictions: List[Dict],
        total_beds: int,
        hospital_name: str
    ) -> List[Dict]:
        """
        Generate alerts for high occupancy predictions
        
        Args:
            predictions: List of prediction dictionaries
            total_beds: Total bed capacity
            hospital_name: Name of hospital for alert messages
            
        Returns:
            List of alert dictionaries
        """
        alerts = []
        
        for pred in predictions:
            utilization = (pred['predicted_occupancy'] / total_beds) * 100
            severity = self.calculate_risk_level(pred['predicted_occupancy'], total_beds)
            
            # Generate alert only for yellow/red severity
            if severity in ['yellow', 'red']:
                message = self._generate_alert_message(
                    severity,
                    utilization,
                    pred['date'],
                    hospital_name
                )
                
                alerts.append({
                    'date': pred['date'],
                    'predicted_occupancy': pred['predicted_occupancy'],
                    'utilization_percentage': round(utilization, 1),
                    'severity': severity,
                    'message': message
                })
        
        return alerts
    
    def _generate_alert_message(
        self,
        severity: str,
        utilization: float,
        date,
        hospital_name: str
    ) -> str:
        """Generate human-readable alert message"""
        if severity == 'red':
            return (
                f"⚠️ CRITICAL: {hospital_name} predicted to reach {utilization:.1f}% "
                f"occupancy on {date}. Immediate action required to prevent overcrowding."
            )
        elif severity == 'yellow':
            return (
                f"⚡ WARNING: {hospital_name} predicted to reach {utilization:.1f}% "
                f"occupancy on {date}. Monitor closely and prepare contingency plans."
            )
        else:
            return (
                f"✓ NORMAL: {hospital_name} occupancy at {utilization:.1f}% on {date}."
            )


# Singleton instance
prediction_service = PredictionService()

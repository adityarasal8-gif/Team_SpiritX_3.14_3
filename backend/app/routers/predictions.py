"""
Predictions and Analytics Router

Endpoints:
- GET /api/predict/{hospital_id} - Generate bed occupancy predictions
- GET /api/dashboard/{hospital_id} - Complete dashboard data with analytics
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from datetime import date, timedelta
from app.database import get_db
from app.models.hospital import Hospital, EHRRecord
from app.schemas.hospital import (
    PredictionResponse,
    PredictionPoint,
    DashboardResponse,
    AlertItem
)
from app.services.prediction_service import prediction_service

router = APIRouter()


@router.get("/predict/{hospital_id}", response_model=PredictionResponse)
async def predict_occupancy(
    hospital_id: int,
    days: int = Query(default=7, ge=1, le=30, description="Number of days to predict"),
    db: Session = Depends(get_db)
):
    """
    Generate bed occupancy predictions for a hospital
    
    Uses Prophet time-series forecasting to predict future bed occupancy
    based on historical EHR data.
    
    Args:
        hospital_id: Hospital ID
        days: Number of days to predict (1-30, default 7)
        db: Database session
        
    Returns:
        Predictions with confidence intervals and model metadata
        
    Raises:
        404: Hospital not found
        400: Insufficient historical data
    """
    # Get hospital
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hospital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hospital with ID {hospital_id} not found"
        )
    
    # Get historical EHR records (minimum 14 days required)
    ehr_records = db.query(EHRRecord).filter(
        EHRRecord.hospital_id == hospital_id
    ).order_by(EHRRecord.date).all()
    
    if len(ehr_records) < 14:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient historical data. Need at least 14 days, found {len(ehr_records)}"
        )
    
    try:
        # Generate predictions
        predictions, model_info = prediction_service.predict_occupancy(
            ehr_records=ehr_records,
            days=days
        )
        
        # Convert to response format
        prediction_points = [
            PredictionPoint(**pred) for pred in predictions
        ]
        
        return PredictionResponse(
            hospital_id=hospital.id,
            hospital_name=hospital.hospital_name,
            total_beds=hospital.total_beds,
            predictions=prediction_points,
            model_info=model_info
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )


@router.get("/dashboard/{hospital_id}", response_model=DashboardResponse)
async def get_dashboard(
    hospital_id: int,
    db: Session = Depends(get_db)
):
    """
    Get complete dashboard data for a hospital
    
    Provides:
    - Current hospital metrics
    - Historical occupancy data (last 30 days)
    - 7-day predictions
    - Alerts for high occupancy
    - Overall status assessment
    
    Args:
        hospital_id: Hospital ID
        db: Database session
        
    Returns:
        Complete dashboard data
        
    Raises:
        404: Hospital not found
        400: Insufficient data
    """
    # Get hospital
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hospital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hospital with ID {hospital_id} not found"
        )
    
    # Get latest EHR record for current metrics
    latest_record = db.query(EHRRecord).filter(
        EHRRecord.hospital_id == hospital_id
    ).order_by(desc(EHRRecord.date)).first()
    
    if not latest_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No EHR records found for hospital {hospital_id}"
        )
    
    # Calculate current utilization
    current_utilization = (latest_record.occupied_beds / hospital.total_beds) * 100
    
    # Get historical data (last 30 days)
    thirty_days_ago = date.today() - timedelta(days=30)
    historical_records = db.query(EHRRecord).filter(
        EHRRecord.hospital_id == hospital_id,
        EHRRecord.date >= thirty_days_ago
    ).order_by(EHRRecord.date).all()
    
    # Format historical data
    historical_data = [
        {
            'date': record.date.isoformat(),
            'occupied_beds': record.occupied_beds,
            'admissions': record.admissions,
            'discharges': record.discharges,
            'icu_occupied': record.icu_occupied,
            'emergency_cases': record.emergency_cases,
            'utilization': (record.occupied_beds / hospital.total_beds) * 100
        }
        for record in historical_records
    ]
    
    # Generate predictions (7 days)
    predictions = []
    alerts = []
    
    try:
        # Get all records for prediction
        all_records = db.query(EHRRecord).filter(
            EHRRecord.hospital_id == hospital_id
        ).order_by(EHRRecord.date).all()
        
        if len(all_records) >= 14:
            pred_data, model_info = prediction_service.predict_occupancy(
                ehr_records=all_records,
                days=7
            )
            
            # Convert predictions
            predictions = [
                PredictionPoint(**pred) for pred in pred_data
            ]
            
            # Generate alerts
            alert_data = prediction_service.generate_alerts(
                predictions=pred_data,
                total_beds=hospital.total_beds,
                hospital_name=hospital.hospital_name
            )
            
            alerts = [AlertItem(**alert) for alert in alert_data]
    
    except Exception as e:
        # If prediction fails, return empty predictions
        print(f"Prediction error: {str(e)}")
        predictions = []
        alerts = []
    
    # Determine overall status
    if alerts:
        # Check if any red alerts
        has_red = any(alert.severity == 'red' for alert in alerts)
        has_yellow = any(alert.severity == 'yellow' for alert in alerts)
        
        if has_red:
            overall_status = 'red'
        elif has_yellow:
            overall_status = 'yellow'
        else:
            overall_status = 'green'
    else:
        # Base on current utilization
        if current_utilization >= 85:
            overall_status = 'red'
        elif current_utilization >= 70:
            overall_status = 'yellow'
        else:
            overall_status = 'green'
    
    return DashboardResponse(
        hospital_id=hospital.id,
        hospital_name=hospital.hospital_name,
        location=hospital.location,
        total_beds=hospital.total_beds,
        icu_beds=hospital.icu_beds,
        current_occupied=latest_record.occupied_beds,
        current_icu_occupied=latest_record.icu_occupied,
        current_utilization=round(current_utilization, 1),
        historical_data=historical_data,
        predictions=predictions,
        alerts=alerts,
        overall_status=overall_status
    )

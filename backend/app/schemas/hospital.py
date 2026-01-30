"""
Pydantic Schemas for Request/Response Validation

This module defines data validation schemas for:
- Hospital creation and retrieval
- EHR record submission and retrieval
- Prediction results
- Dashboard analytics
"""

from pydantic import BaseModel, Field, ConfigDict
from datetime import date as date_type, datetime as datetime_type
from typing import Optional, List
import datetime


# ============== Hospital Schemas ==============

class HospitalBase(BaseModel):
    """Base schema for hospital data"""
    hospital_name: str = Field(..., min_length=1, max_length=200, description="Name of the hospital")
    location: str = Field(..., min_length=1, max_length=200, description="Hospital location/address")
    total_beds: int = Field(..., gt=0, description="Total number of beds")
    icu_beds: int = Field(..., ge=0, description="Number of ICU beds")


class HospitalCreate(HospitalBase):
    """Schema for creating a new hospital"""
    pass


class HospitalResponse(HospitalBase):
    """Schema for hospital response"""
    id: int
    created_at: datetime_type
    
    model_config = ConfigDict(from_attributes=True)


# ============== EHR Record Schemas ==============

class EHRRecordBase(BaseModel):
    """Base schema for EHR record data"""
    date: date_type = Field(..., description="Date of the record")
    admissions: int = Field(..., ge=0, description="Number of admissions")
    discharges: int = Field(..., ge=0, description="Number of discharges")
    occupied_beds: int = Field(..., ge=0, description="Total occupied beds")
    icu_occupied: int = Field(..., ge=0, description="ICU beds occupied")
    emergency_cases: int = Field(..., ge=0, description="Number of emergency cases")


class EHRRecordCreate(EHRRecordBase):
    """Schema for creating a new EHR record"""
    hospital_id: int = Field(..., gt=0, description="Hospital ID")


class EHRRecordResponse(EHRRecordBase):
    """Schema for EHR record response"""
    id: int
    hospital_id: int
    created_at: datetime_type
    
    model_config = ConfigDict(from_attributes=True)


# ============== Prediction Schemas ==============

class PredictionPoint(BaseModel):
    """Single prediction data point"""
    date: date_type = Field(..., description="Prediction date")
    predicted_occupancy: float = Field(..., description="Predicted bed occupancy")
    lower_bound: Optional[float] = Field(None, description="Lower confidence bound")
    upper_bound: Optional[float] = Field(None, description="Upper confidence bound")


class PredictionResponse(BaseModel):
    """Schema for prediction response"""
    hospital_id: int
    hospital_name: str
    total_beds: int
    predictions: List[PredictionPoint]
    model_info: dict = Field(..., description="Model metadata")


# ============== Analytics & Dashboard Schemas ==============

class AlertItem(BaseModel):
    """Alert for high occupancy prediction"""
    date: date_type
    predicted_occupancy: float
    utilization_percentage: float
    severity: str = Field(..., description="Alert severity: green, yellow, red")
    message: str


class DashboardResponse(BaseModel):
    """Complete dashboard data response"""
    hospital_id: int
    hospital_name: str
    location: str
    
    # Current metrics
    total_beds: int
    icu_beds: int
    current_occupied: int
    current_icu_occupied: int
    current_utilization: float
    
    # Historical data (last 30 days)
    historical_data: List[dict]
    
    # Predictions (next 7 days)
    predictions: List[PredictionPoint]
    
    # Alerts
    alerts: List[AlertItem]
    
    # Status
    overall_status: str = Field(..., description="Overall status: green, yellow, red")

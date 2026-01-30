"""
Public Patient API Router

Patient-safe endpoints that expose only aggregated prediction data.
No raw EHR data is exposed. Accessible to PATIENT role.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import date, timedelta
from app.database import get_db
from app.models.hospital import Hospital, EHRRecord
from app.models.user import User
from app.services.auth_service import get_current_user
from app.services.prediction_service import PredictionService
from app.schemas.public import (
    PublicHospitalInfo,
    HospitalAvailability,
    HospitalForecast,
    DayForecast,
    HospitalComparison,
    CityRecommendation,
    AvailabilityAlert,
    AlertsResponse
)

router = APIRouter(prefix="/public", tags=["Public Patient API"])
prediction_service = PredictionService()


@router.get("/hospitals", response_model=List[PublicHospitalInfo])
async def get_public_hospitals(
    city: Optional[str] = Query(None, description="Filter by city/location"),
    db: Session = Depends(get_db)
):
    """
    Get list of all hospitals (public information only)
    
    Accessible without authentication. Returns basic hospital info.
    """
    query = db.query(Hospital)
    
    if city:
        query = query.filter(Hospital.location.ilike(f"%{city}%"))
    
    hospitals = query.all()
    
    return [PublicHospitalInfo(
        id=h.id,
        hospital_name=h.hospital_name,
        location=h.location,
        total_beds=h.total_beds,
        icu_beds=h.icu_beds
    ) for h in hospitals]


@router.get("/availability/{hospital_id}", response_model=HospitalAvailability)
async def get_hospital_availability(
    hospital_id: int,
    db: Session = Depends(get_db)
):
    """
    Get current bed availability for a hospital
    
    Shows real-time occupancy status without exposing sensitive EHR data.
    """
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hospital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hospital not found"
        )
    
    # Get latest EHR record for current occupancy
    latest_record = db.query(EHRRecord).filter(
        EHRRecord.hospital_id == hospital_id
    ).order_by(desc(EHRRecord.date)).first()
    
    if not latest_record:
        # Return a response indicating no data instead of 404
        return HospitalAvailability(
            hospital_id=hospital.id,
            hospital_name=hospital.hospital_name,
            location=hospital.location,
            total_beds=hospital.total_beds,
            current_occupied=0,
            current_available=hospital.total_beds,
            utilization_percentage=0.0,
            status="unknown",
            last_updated=None
        )
    
    current_occupied = latest_record.occupied_beds
    current_available = hospital.total_beds - current_occupied
    utilization = (current_occupied / hospital.total_beds) * 100
    
    # Determine status
    if utilization >= 85:
        status_str = "high"
    elif utilization >= 70:
        status_str = "moderate"
    else:
        status_str = "available"
    
    return HospitalAvailability(
        hospital_id=hospital.id,
        hospital_name=hospital.hospital_name,
        location=hospital.location,
        total_beds=hospital.total_beds,
        current_occupied=current_occupied,
        current_available=current_available,
        utilization_percentage=round(utilization, 1),
        status=status_str,
        last_updated=latest_record.date.isoformat()
    )


@router.get("/forecast/{hospital_id}", response_model=HospitalForecast)
async def get_hospital_forecast(
    hospital_id: int,
    days: int = Query(7, ge=1, le=14, description="Number of days to forecast"),
    db: Session = Depends(get_db)
):
    """
    Get occupancy forecast for next N days
    
    Uses ML prediction to show expected bed availability.
    Helps patients plan their visit timing.
    """
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hospital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hospital not found"
        )
    
    # Get all EHR records for prediction
    ehr_records = db.query(EHRRecord).filter(
        EHRRecord.hospital_id == hospital_id
    ).order_by(EHRRecord.date).all()
    
    if len(ehr_records) < 14:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient data for prediction (minimum 14 days required)"
        )
    
    # Generate predictions
    try:
        predictions, model_info = prediction_service.predict_occupancy(
            ehr_records=ehr_records,
            days=days
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )
    
    # Format forecast with risk levels
    forecast_days = []
    min_occupancy = float('inf')
    best_day = None
    
    for pred in predictions:
        predicted_occ = int(pred['predicted_occupancy'])
        available = hospital.total_beds - predicted_occ
        utilization = (predicted_occ / hospital.total_beds) * 100
        
        # Determine risk level
        if utilization >= 85:
            risk = "high"
        elif utilization >= 70:
            risk = "medium"
        else:
            risk = "low"
        
        # Track best day
        if predicted_occ < min_occupancy:
            min_occupancy = predicted_occ
            best_day = pred['date']
        
        forecast_days.append(DayForecast(
            date=pred['date'].isoformat() if hasattr(pred['date'], 'isoformat') else str(pred['date']),
            predicted_occupancy=predicted_occ,
            predicted_available=available,
            utilization_percentage=round(utilization, 1),
            risk_level=risk
        ))
    
    return HospitalForecast(
        hospital_id=hospital.id,
        hospital_name=hospital.hospital_name,
        location=hospital.location,
        total_beds=hospital.total_beds,
        forecast=forecast_days,
        best_day_to_visit=best_day.isoformat() if best_day and hasattr(best_day, 'isoformat') else str(best_day) if best_day else None,
        best_day_occupancy=int(min_occupancy) if min_occupancy != float('inf') else None
    )


@router.get("/compare", response_model=List[HospitalComparison])
async def compare_hospitals(
    city: Optional[str] = Query(None, description="Filter by city"),
    db: Session = Depends(get_db)
):
    """
    Compare hospitals by current and predicted availability
    
    Ranks hospitals to help patients choose the best option.
    """
    query = db.query(Hospital)
    
    if city:
        query = query.filter(Hospital.location.ilike(f"%{city}%"))
    
    hospitals = query.all()
    
    if not hospitals:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No hospitals found"
        )
    
    comparisons = []
    
    for hospital in hospitals:
        # Get current occupancy
        latest_record = db.query(EHRRecord).filter(
            EHRRecord.hospital_id == hospital.id
        ).order_by(desc(EHRRecord.date)).first()
        
        if not latest_record:
            continue
        
        current_occ = latest_record.occupied_beds
        current_avail = hospital.total_beds - current_occ
        utilization = (current_occ / hospital.total_beds) * 100
        
        # Get 7-day prediction average
        ehr_records = db.query(EHRRecord).filter(
            EHRRecord.hospital_id == hospital.id
        ).order_by(EHRRecord.date).all()
        
        avg_predicted = current_occ  # Default to current if prediction fails
        
        if len(ehr_records) >= 14:
            try:
                predictions, _ = prediction_service.predict_occupancy(
                    ehr_records=ehr_records,
                    days=7
                )
                avg_predicted = sum(p['predicted_occupancy'] for p in predictions) / len(predictions)
            except:
                pass
        
        # Calculate recommendation score (0-100, higher is better)
        # Lower occupancy = higher score
        availability_score = ((hospital.total_beds - current_occ) / hospital.total_beds) * 50
        future_availability_score = ((hospital.total_beds - avg_predicted) / hospital.total_beds) * 50
        recommendation_score = availability_score + future_availability_score
        
        # Determine risk level
        if utilization >= 85:
            risk = "high"
        elif utilization >= 70:
            risk = "medium"
        else:
            risk = "low"
        
        comparisons.append(HospitalComparison(
            hospital_id=hospital.id,
            hospital_name=hospital.hospital_name,
            location=hospital.location,
            current_occupancy=current_occ,
            current_available=current_avail,
            utilization_percentage=round(utilization, 1),
            avg_predicted_occupancy_7_days=round(avg_predicted, 1),
            recommendation_score=round(recommendation_score, 1),
            risk_level=risk
        ))
    
    # Sort by recommendation score (highest first)
    comparisons.sort(key=lambda x: x.recommendation_score, reverse=True)
    
    return comparisons


@router.get("/recommendation/{city}", response_model=CityRecommendation)
async def get_city_recommendation(
    city: str,
    db: Session = Depends(get_db)
):
    """
    Get best hospital recommendation for a city
    
    Analyzes all hospitals in a city and recommends the best option
    based on current and predicted availability.
    """
    comparisons = await compare_hospitals(city=city, db=db)
    
    if not comparisons:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No hospitals found in {city}"
        )
    
    best = comparisons[0]
    
    # Generate reason
    if best.risk_level == "low":
        reason = f"{best.hospital_name} has good availability with {best.current_available} beds available ({best.utilization_percentage}% occupied)."
    elif best.risk_level == "medium":
        reason = f"{best.hospital_name} is moderately busy but still accepting patients ({best.utilization_percentage}% occupied)."
    else:
        reason = f"{best.hospital_name} is the best option despite high occupancy. Consider calling ahead."
    
    return CityRecommendation(
        city=city,
        recommended_hospitals=comparisons,
        best_hospital_id=best.hospital_id,
        best_hospital_name=best.hospital_name,
        reason=reason
    )


@router.get("/alerts/{hospital_id}", response_model=AlertsResponse)
async def get_hospital_alerts(
    hospital_id: int,
    db: Session = Depends(get_db)
):
    """
    Get availability alerts for a hospital
    
    Warns patients if hospital is expected to be crowded.
    Suggests alternatives if needed based on risk levels.
    """
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hospital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hospital not found"
        )
    
    alerts = []
    has_high_risk = False
    
    # Get predictions
    ehr_records = db.query(EHRRecord).filter(
        EHRRecord.hospital_id == hospital_id
    ).order_by(EHRRecord.date).all()
    
    if len(ehr_records) >= 14:
        try:
            predictions, _ = prediction_service.predict_occupancy(
                ehr_records=ehr_records,
                days=7
            )
            
            # Check for high occupancy days
            for pred in predictions:
                predicted_occ = pred['predicted_occupancy']
                utilization = (predicted_occ / hospital.total_beds) * 100
                date_str = pred['date'].isoformat() if hasattr(pred['date'], 'isoformat') else str(pred['date'])
                
                # Create alerts for medium and high risk levels
                if utilization >= 85:
                    has_high_risk = True
                    alerts.append(AvailabilityAlert(
                        alert_type="high_occupancy",
                        message=f"Critical occupancy expected on {date_str} ({utilization:.0f}%). Long wait times likely. Consider visiting an alternate hospital or a different day.",
                        severity="critical",
                        date=date_str
                    ))
                elif utilization >= 70:
                    alerts.append(AvailabilityAlert(
                        alert_type="capacity_warning",
                        message=f"Moderate occupancy expected on {date_str} ({utilization:.0f}%). May experience longer wait times.",
                        severity="warning",
                        date=date_str
                    ))
        
        except Exception as e:
            # If prediction fails, return empty alerts
            pass
    
    # Get alternate hospitals if there are high risk alerts
    alternate_hospitals = []
    if has_high_risk or len(alerts) >= 3:
        # Find hospitals in same location with better availability
        other_hospitals = db.query(Hospital).filter(
            Hospital.location.ilike(f"%{hospital.location.split(',')[0]}%"),
            Hospital.id != hospital_id
        ).all()
        
        # Get current availability for alternates
        for alt_hospital in other_hospitals[:5]:  # Check up to 5 hospitals
            latest_record = db.query(EHRRecord).filter(
                EHRRecord.hospital_id == alt_hospital.id
            ).order_by(desc(EHRRecord.date)).first()
            
            if latest_record:
                alt_utilization = (latest_record.occupied_beds / alt_hospital.total_beds) * 100
                # Only recommend hospitals with better availability (< 70%)
                if alt_utilization < 70:
                    alternate_hospitals.append(PublicHospitalInfo(
                        id=alt_hospital.id,
                        hospital_name=alt_hospital.hospital_name,
                        location=alt_hospital.location,
                        total_beds=alt_hospital.total_beds,
                        icu_beds=alt_hospital.icu_beds
                    ))
                    if len(alternate_hospitals) >= 3:
                        break
    
    return AlertsResponse(
        hospital_id=hospital.id,
        hospital_name=hospital.hospital_name,
        alerts=alerts,
        alternate_hospitals=alternate_hospitals
    )

"""
Hospital Management Router

Endpoints:
- POST /api/hospitals - Create a new hospital
- GET /api/hospitals - List all hospitals
- GET /api/hospitals/{hospital_id} - Get specific hospital details
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.hospital import Hospital
from app.schemas.hospital import HospitalCreate, HospitalResponse

router = APIRouter()


@router.post("/hospitals", response_model=HospitalResponse, status_code=status.HTTP_201_CREATED)
async def create_hospital(
    hospital: HospitalCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new hospital in the system
    
    Args:
        hospital: Hospital data including name, location, and bed capacity
        db: Database session
        
    Returns:
        Created hospital with assigned ID
    """
    # Validate ICU beds don't exceed total beds
    if hospital.icu_beds > hospital.total_beds:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ICU beds cannot exceed total beds"
        )
    
    # Create new hospital instance
    db_hospital = Hospital(**hospital.model_dump())
    db.add(db_hospital)
    db.commit()
    db.refresh(db_hospital)
    
    return db_hospital


@router.get("/hospitals", response_model=List[HospitalResponse])
async def get_hospitals(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Retrieve all hospitals with pagination
    
    Args:
        skip: Number of records to skip (for pagination)
        limit: Maximum number of records to return
        db: Database session
        
    Returns:
        List of hospitals
    """
    hospitals = db.query(Hospital).offset(skip).limit(limit).all()
    return hospitals


@router.get("/hospitals/{hospital_id}", response_model=HospitalResponse)
async def get_hospital(
    hospital_id: int,
    db: Session = Depends(get_db)
):
    """
    Get specific hospital by ID
    
    Args:
        hospital_id: Hospital ID
        db: Database session
        
    Returns:
        Hospital details
        
    Raises:
        404: Hospital not found
    """
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    
    if not hospital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hospital with ID {hospital_id} not found"
        )
    
    return hospital

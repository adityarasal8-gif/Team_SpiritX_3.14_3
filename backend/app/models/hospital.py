"""
Database Models for Hospital Management System

This module defines SQLAlchemy ORM models for:
- Hospital: Core hospital information and bed capacity
- EHRRecord: Daily electronic health records with admission/discharge data
"""

from sqlalchemy import Column, Integer, String, Date, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Hospital(Base):
    """
    Hospital Model
    Stores hospital information and bed capacity details
    """
    __tablename__ = "hospitals"
    
    id = Column(Integer, primary_key=True, index=True)
    hospital_name = Column(String, nullable=False, index=True)
    location = Column(String, nullable=False)
    total_beds = Column(Integer, nullable=False)
    icu_beds = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship to EHR records
    ehr_records = relationship("EHRRecord", back_populates="hospital", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Hospital {self.hospital_name} - {self.location}>"


class EHRRecord(Base):
    """
    EHR (Electronic Health Record) Daily Data Model
    Stores daily operational metrics for hospital bed management
    
    Key metrics:
    - admissions: New patients admitted
    - discharges: Patients discharged
    - occupied_beds: Total beds currently occupied
    - icu_occupied: ICU beds currently occupied
    - emergency_cases: Emergency admissions
    """
    __tablename__ = "ehr_records"
    
    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    admissions = Column(Integer, nullable=False, default=0)
    discharges = Column(Integer, nullable=False, default=0)
    occupied_beds = Column(Integer, nullable=False)
    icu_occupied = Column(Integer, nullable=False, default=0)
    emergency_cases = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship to hospital
    hospital = relationship("Hospital", back_populates="ehr_records")
    
    def __repr__(self):
        return f"<EHRRecord Hospital:{self.hospital_id} Date:{self.date}>"
    
    @property
    def utilization_rate(self):
        """Calculate bed utilization percentage"""
        if self.hospital and self.hospital.total_beds > 0:
            return (self.occupied_beds / self.hospital.total_beds) * 100
        return 0.0

"""
Simple script to add EHR data for existing hospitals
"""
import sys
sys.path.insert(0, 'D:/CIH_1/backend')

from datetime import datetime, timedelta
from app.database import SessionLocal
from app.models.hospital import Hospital, EHRRecord
from app.models.user import User  # Import User to avoid mapper initialization error
import random

def add_ehr_data():
    db = SessionLocal()
    try:
        hospitals = db.query(Hospital).all()
        print(f"Found {len(hospitals)} hospitals")
        
        for hospital in hospitals:
            print(f"\nAdding EHR data for {hospital.hospital_name}...")
            
            # Check if data already exists
            existing = db.query(EHRRecord).filter(
                EHRRecord.hospital_id == hospital.id
            ).count()
            
            if existing > 0:
                print(f"  Already has {existing} records, skipping...")
                continue
            
            # Generate 60 days of historical data
            start_date = datetime.now() - timedelta(days=60)
            
            for day in range(60):
                date = start_date + timedelta(days=day)
                
                # Generate realistic occupancy (60-90%)
                base_occupancy = 0.7 + (random.random() * 0.2)
                occupied_beds = int(hospital.total_beds * base_occupancy)
                icu_occupied = int(hospital.icu_beds * (base_occupancy + 0.1))
                
                record = EHRRecord(
                    hospital_id=hospital.id,
                    date=date.date(),
                    occupied_beds=occupied_beds,
                    icu_occupied=min(icu_occupied, hospital.icu_beds),
                    admissions=random.randint(5, 15),
                    discharges=random.randint(5, 15),
                    emergency_cases=random.randint(0, 5)
                )
                db.add(record)
            
            db.commit()
            print(f"  ✓ Added 60 days of EHR data")
        
        print("\n✓ All done!")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_ehr_data()

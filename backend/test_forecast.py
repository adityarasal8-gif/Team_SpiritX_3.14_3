"""Test forecast endpoint"""
from app.database import SessionLocal
from app.models.hospital import Hospital, EHRRecord
from app.models.user import User  # Import to resolve relationship
from app.services.prediction_service import PredictionService

db = SessionLocal()

try:
    # Check EHR data
    records = db.query(EHRRecord).filter(EHRRecord.hospital_id == 1).count()
    print(f"Hospital 1 has {records} EHR records")
    
    if records >= 14:
        hospital = db.query(Hospital).filter(Hospital.id == 1).first()
        print(f"Hospital: {hospital.hospital_name}")
        
        # Get records for prediction
        ehr_records = db.query(EHRRecord).filter(
            EHRRecord.hospital_id == 1
        ).order_by(EHRRecord.date).all()
        
        # Try prediction
        print("Attempting prediction...")
        prediction_service = PredictionService()
        predictions, model_info = prediction_service.predict_occupancy(
            ehr_records=ehr_records,
            days=7
        )
        
        print(f"✓ Prediction successful! {len(predictions)} days forecasted")
        print(f"First prediction: {predictions[0]}")
    else:
        print(f"✗ Not enough data. Need 14 records, have {records}")
        
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()

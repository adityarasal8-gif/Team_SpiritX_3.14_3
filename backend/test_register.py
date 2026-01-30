"""Test registration endpoint"""
from app.database import SessionLocal
from app.models.hospital import Hospital  # Import Hospital first
from app.models.user import User, UserRole
from app.services.auth_service import hash_password

# Test database connection
db = SessionLocal()

try:
    # Try to create a test user
    test_user = User(
        name="Test User",
        email="testuser123@example.com",
        hashed_password=hash_password("password123"),
        role=UserRole.PATIENT,
        hospital_id=None
    )
    
    # Check if email exists
    existing = db.query(User).filter(User.email == test_user.email).first()
    if existing:
        print(f"User already exists with email: {test_user.email}")
        print(f"Deleting existing user...")
        db.delete(existing)
        db.commit()
    
    db.add(test_user)
    db.commit()
    db.refresh(test_user)
    
    print("✓ User created successfully!")
    print(f"  ID: {test_user.id}")
    print(f"  Name: {test_user.name}")
    print(f"  Email: {test_user.email}")
    print(f"  Role: {test_user.role}")
    print(f"  Hospital ID: {test_user.hospital_id}")
    
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()

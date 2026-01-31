"""
Mock External Hospital API Server
Simulates a real hospital's API for demonstration purposes

Run with: python mock_external_api.py
Access at: http://localhost:9000/api/beds
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from datetime import datetime
import random

app = FastAPI(title="Mock Hospital API", description="Simulated external hospital API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "message": "Mock Hospital API v1.0",
        "documentation": "/docs",
        "endpoints": {
            "beds": "/api/beds",
            "occupancy": "/api/occupancy",
            "admissions": "/api/admissions"
        }
    }

@app.get("/api/beds")
def get_bed_status():
    """
    Simulates real-time bed availability data
    Format compatible with your hospital integration
    """
    total_beds = 180
    occupied = random.randint(120, 165)
    
    return {
        "status": "success",
        "timestamp": datetime.now().isoformat(),
        "hospital": {
            "name": "Demo General Hospital",
            "location": "Mumbai, Maharashtra",
            "id": "DEMO001"
        },
        "beds": {
            "total": total_beds,
            "occupied": occupied,
            "available": total_beds - occupied,
            "occupancy_percent": round((occupied / total_beds) * 100, 2)
        },
        "icu": {
            "total": 25,
            "occupied": random.randint(15, 24),
            "available": random.randint(1, 10)
        },
        "emergency": {
            "total": 20,
            "occupied": random.randint(10, 18),
            "available": random.randint(2, 10)
        }
    }

@app.get("/api/occupancy")
def get_occupancy_history():
    """Returns last 7 days of occupancy data"""
    from datetime import timedelta
    
    history = []
    for i in range(7, 0, -1):
        date = datetime.now() - timedelta(days=i)
        occupied = random.randint(120, 165)
        history.append({
            "date": date.strftime("%Y-%m-%d"),
            "occupied_beds": occupied,
            "occupancy_percent": round((occupied / 180) * 100, 2)
        })
    
    return {
        "status": "success",
        "data": history
    }

@app.get("/api/admissions")
def get_admissions():
    """Returns today's admission/discharge data"""
    return {
        "status": "success",
        "date": datetime.now().strftime("%Y-%m-%d"),
        "admissions": {
            "total": random.randint(15, 30),
            "emergency": random.randint(5, 12),
            "scheduled": random.randint(10, 18)
        },
        "discharges": random.randint(12, 28),
        "transfers": random.randint(2, 8)
    }

if __name__ == "__main__":
    print("=" * 60)
    print("🏥 Mock Hospital API Server Starting...")
    print("=" * 60)
    print("\nEndpoints:")
    print("  📊 Bed Status: http://localhost:9000/api/beds")
    print("  📈 Occupancy History: http://localhost:9000/api/occupancy")
    print("  🚑 Admissions: http://localhost:9000/api/admissions")
    print("  📖 Documentation: http://localhost:9000/docs")
    print("\n" + "=" * 60)
    
    uvicorn.run(app, host="0.0.0.0", port=9000)

"""
Hospital Bed Occupancy Prediction System
FastAPI Main Application

This is the entry point for the hospital management and prediction API.
It handles:
- CORS configuration for frontend communication
- Database initialization
- Router registration
- Health check endpoints
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import hospitals, ehr, predictions

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Hospital Bed Occupancy Prediction API",
    description="Predictive software for hospital bed occupancy using EHR data to reduce patient wait times",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for frontend communication
# In production, replace "*" with specific frontend URLs
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(hospitals.router, prefix="/api", tags=["Hospitals"])
app.include_router(ehr.router, prefix="/api", tags=["EHR Records"])
app.include_router(predictions.router, prefix="/api", tags=["Predictions & Analytics"])

@app.get("/")
async def root():
    """Root endpoint - API health check"""
    return {
        "message": "Hospital Bed Occupancy Prediction API",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {"status": "healthy"}

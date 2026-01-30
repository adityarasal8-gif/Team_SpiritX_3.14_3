"""
Authentication Schemas

Pydantic models for authentication requests and responses.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from app.models.user import UserRole


class UserRegister(BaseModel):
    """User registration request"""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: UserRole = UserRole.PATIENT
    hospital_id: Optional[int] = None  # Required for HOSPITAL_ADMIN


class UserLogin(BaseModel):
    """User login request"""
    email: EmailStr
    password: str


class Token(BaseModel):
    """JWT token response"""
    access_token: str
    token_type: str = "bearer"
    role: UserRole
    user_id: int
    name: str
    hospital_id: Optional[int] = None


class TokenData(BaseModel):
    """Data stored in JWT token"""
    user_id: int
    email: str
    role: UserRole
    hospital_id: Optional[int] = None


class UserResponse(BaseModel):
    """User information response"""
    id: int
    name: str
    email: str
    role: UserRole
    hospital_id: Optional[int] = None
    
    class Config:
        from_attributes = True

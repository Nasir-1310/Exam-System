# Backend/app/schemas/auth.py
from pydantic import BaseModel, Field
from datetime import date
from typing import Optional
from pydantic.networks import EmailStr
from app.models.enums import UserRole
from app.schemas.user import UserResponse

class Token(BaseModel):
    token: str
    token_type: str = "bearer"
    expires_in: Optional[str] = None
    role: Optional[UserRole] = None


class TokenResponse(Token):
    user: UserResponse


class TokenData(BaseModel):
    email: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    """
    User registration request.
    Required: name, email, password, active_mobile
    Optional: dob, whatsapp, role
    """
    name: str = Field(..., min_length=2, max_length=255, description="Full name")
    email: EmailStr = Field(..., description="Email address")
    password: str = Field(..., min_length=6, description="Password (min 6 characters)")
    active_mobile: str = Field(..., min_length=11, max_length=20, description="Active mobile number")
    
    # Optional fields
    dob: Optional[date] = Field(None, description="Date of birth (YYYY-MM-DD)")
    whatsapp: Optional[str] = Field(None, max_length=20, description="WhatsApp number")
    role: Optional[str] = Field(None, description="User role (ADMIN, MODERATOR, USER)")  # ← ADD THIS LINE
    is_anonymous: Optional[bool] = Field(False, description="Whether this user was auto-created for anonymous exam submission")
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "Ahmed Hassan",
                "email": "ahmed@example.com",
                "password": "securepass123",
                "active_mobile": "01712345678",
                "whatsapp": "01712345678",
                "dob": "2000-01-15",
                "role": "ADMIN",  # ← ADD THIS LINE
                "is_anonymous": False
            }
        }

class CourseEnrollmentRequest(BaseModel):
    user_id: int = Field(..., description="ID of the user to enroll")
    course_id: int = Field(..., description="ID of the course to enroll in")
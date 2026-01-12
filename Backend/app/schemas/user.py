from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date
from app.models.enums import UserRole

class UserBase(BaseModel):
    name: Optional[str] = None
    dob: Optional[date] = None
    email: Optional[EmailStr] = None
    last_login: Optional[date] = None
    role: Optional[UserRole] = None
    active_mobile: Optional[str] = None
    whatsapp: Optional[str] = None

class UserCreate(UserBase):
    email: EmailStr
    password: str
    role: Optional[UserRole] = UserRole.USER
    active_mobile: Optional[str] = None
    whatsapp: Optional[str] = None

class UserUpdate(UserBase):
    role: Optional[UserRole] = None
    active_mobile: Optional[str] = None
    whatsapp: Optional[str] = None

class UserResponse(UserBase):
    id: int
    
    class Config:
        from_attributes = True

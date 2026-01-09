from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date

class UserBase(BaseModel):
    name: Optional[str] = None
    dob: Optional[date] = None
    email: Optional[EmailStr] = None
    last_login: Optional[date] = None
    is_admin: Optional[bool] = None

class UserCreate(UserBase):
    email: EmailStr
    password: str

class UserUpdate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    
    class Config:
        from_attributes = True

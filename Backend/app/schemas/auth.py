from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from pydantic.networks import EmailStr
from app.models.enums import UserRole
from app.schemas.user import UserResponse

class Token(BaseModel):
    token: str
    token_type: Optional[str] = "bearer"
    expires_in: Optional[datetime]
    role: Optional[UserRole] = None


class TokenResponse(Token):
    user: UserResponse


class TokenData(BaseModel):
    email: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    name: str
    dob: datetime
    email: EmailStr
    active_mobile: str
    whatsapp: str
    password: str

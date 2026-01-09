from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from pydantic.networks import EmailStr

class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: datetime


class TokenResponse(Token):
    pass


class TokenData(BaseModel):
    email: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    name: str
    dob: datetime
    email: EmailStr
    password: str


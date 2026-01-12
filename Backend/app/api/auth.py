from datetime import datetime, timedelta
from app.lib.config import settings

from fastapi import APIRouter, Depends, Form, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.lib.db import get_db
from app.services.user_service import *
from app.utils.hashing import verify_password
from app.utils.jwt import create_token, get_current_user
from app.schemas.user import UserResponse
from app.schemas.auth import LoginRequest, TokenResponse, RegisterRequest

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
	user = await get_user_by_email(db, payload.email)

	if not user or not verify_password(payload.password, user.password_hash):
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

	token = create_token(user_id=user.id, role="admin" if user.is_admin else "user")
	expires_time = datetime.utcnow() + timedelta(minutes=settings.token_EXPIRE_MINUTES)

	return TokenResponse(token=token, expires_in=expires_time)


@router.post("/login/docs")
async def login_docs(db: AsyncSession = Depends(get_db), username: str = Form(), password: str = Form()):
	try:
		user = await get_user_by_email(db, username)
		if not user or not verify_password(password, user.password_hash):
			raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
		
		token = create_token(user_id=user.id, role="admin" if user.is_admin else "user")
		expires_time = datetime.utcnow() + timedelta(minutes=settings.TOKEN_EXPIRE_MINUTES)
		return {
			"token": token, 
			"token_type": "bearer",
			"expires_in": expires_time,
			"user": user
		}
	except Exception as e:
		raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("/session", response_model=UserResponse)
async def session(current_user = Depends(get_current_user)):
	return current_user


@router.post("/register", response_model=UserResponse)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)):
	return await create_user(db, payload)
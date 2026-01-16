import os
from datetime import datetime, timedelta, timezone
from typing import Optional, Union
from uuid import UUID

from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession

from app.lib.db import get_db
from app.models.user import User
from sqlalchemy import select
from app.lib.config import settings

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login/docs",
    scheme_name="JWT",
)

def create_token(*, user_id: Union[int, str, UUID], role: str, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = {
        "sub": str(user_id),
        "role": role,
        "iat": int(datetime.now(timezone.utc).timestamp()),
    }
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.TOKEN_EXPIRE_MINUTES, days=settings.TOKEN_EXPIRE_DAYS, hours=settings.TOKEN_EXPIRE_HOURS))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")


async def get_current_user(db: AsyncSession = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        try:
            user_id = int(user_id) if user_id else None
        except (ValueError, TypeError):
             user_id = None
             
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
            
        result = await db.execute(select(User).filter(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        return user
    except JWTError as e:
        print("JWT Error:", str(e))
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    # print("Current user is admin:", current_user.is_admin, type(current_user.is_admin), current_user.name)
    if current_user.is_admin:
        return current_user
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
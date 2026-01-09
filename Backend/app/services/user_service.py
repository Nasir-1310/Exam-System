from app.models import User
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.schemas import RegisterRequest
from app.utils.hashing import get_password_hash

async def get_user_by_email(db: AsyncSession, email: str):
    return await db.execute(select(User).filter(User.email == email)).scalar_one_or_none()

async def get_user_by_id(db: AsyncSession, id: int):
    return await db.execute(select(User).filter(User.id == id)).scalar_one_or_none()


async def create_user(db: AsyncSession, payload: RegisterRequest):
    user = User(
        name=payload.name,
        dob=payload.dob,
        email=payload.email,
        password_hash=get_password_hash(payload.password),
    )
    db.add(user)
    await db.commit()
    return user

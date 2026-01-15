from app.models import User
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.schemas import RegisterRequest
from app.utils.hashing import get_password_hash
from app.models.enums import UserRoleSQL

async def get_user_by_email(db: AsyncSession, email: str):
    result = await db.execute(select(User).filter(User.email == email))
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, id: int):
    result = await db.execute(select(User).filter(User.id == id))
    return result.scalar_one_or_none()


async def create_user(db: AsyncSession, payload: RegisterRequest):
    user = User(
        name=payload.name,
        dob=payload.dob,
        active_mobile=payload.active_mobile,
        whatsapp=payload.whatsapp,
        email=payload.email,
        password_hash=get_password_hash(payload.password),
        role=UserRoleSQL.USER
    )
    db.add(user)
    await db.commit()
    return user

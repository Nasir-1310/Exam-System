# Backend/app/services/user_service.py
from app.models import User, Course, UserCourseRelation
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from app.schemas import RegisterRequest
from app.schemas.user import UserUpdate
from app.utils.hashing import get_password_hash
from app.models.enums import UserRole
from typing import List, Optional


async def get_user_by_email(db: AsyncSession, email: str):
    """Get user by email"""
    result = await db.execute(select(User).filter(User.email == email))
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, id: int):
    """Get user by ID"""
    result = await db.execute(select(User).filter(User.id == id))
    return result.scalar_one_or_none()


async def create_user(db: AsyncSession, payload: RegisterRequest):
    """Create a new user"""
    try:
        # Check if user exists
        existing = await get_user_by_email(db, payload.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create user - use string value for enum
        user = User(
            name=payload.name,
            email=payload.email,
            password_hash=get_password_hash(payload.password),
            active_mobile=payload.active_mobile,
            whatsapp=payload.whatsapp,
            dob=payload.dob,
           role=payload.role if payload.role else UserRole.USER.value  # ← Fix করো এটা
        )
        
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user
        
    except IntegrityError as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Database integrity error"
        )
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        print(f"Error creating user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )


# ========== ADD THESE NEW FUNCTIONS BELOW ==========

async def enroll_user_in_course(db: AsyncSession, user_id: int, course_id: int):
    """Enroll a user in a course"""
    # Check if user and course exist
    user = await db.execute(select(User).where(User.id == user_id))
    if not user.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with ID {user_id} not found")

    course = await db.execute(select(Course).where(Course.id == course_id))
    if not course.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Course with ID {course_id} not found")

    # Check if already enrolled
    existing_enrollment = await db.execute(
        select(UserCourseRelation).where(
            UserCourseRelation.c.User_id == user_id,
            UserCourseRelation.c.Course_id == course_id
        )
    )
    if existing_enrollment.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User already enrolled in this course")

    # Enroll user
    await db.execute(UserCourseRelation.insert().values(User_id=user_id, Course_id=course_id))
    await db.commit()
    return {"message": f"User {user_id} enrolled in course {course_id}"}


async def get_all_users(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[User]:
    """Get all users with pagination"""
    result = await db.execute(
        select(User).offset(skip).limit(limit)
    )
    return result.scalars().all()


async def update_user(db: AsyncSession, user_id: int, user_update: UserUpdate) -> Optional[User]:
    """Update user information"""
    try:
        user = await get_user_by_id(db, user_id)
        if not user:
            return None
        
        # Update only provided fields
        update_data = user_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if field == "role" and value is not None:
                # Convert enum to string for role
                setattr(user, field, value.value if hasattr(value, 'value') else value)
            else:
                setattr(user, field, value)
        
        await db.commit()
        await db.refresh(user)
        
        return user
        
    except Exception as e:
        await db.rollback()
        print(f"Error updating user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user"
        )


async def delete_user(db: AsyncSession, user_id: int) -> bool:
    """Delete a user"""
    try:
        user = await get_user_by_id(db, user_id)
        if not user:
            return False
        
        await db.delete(user)
        await db.commit()
        
        return True
        
    except Exception as e:
        await db.rollback()
        print(f"Error deleting user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete user"
        )
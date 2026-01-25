# Backend/app/api/user.py
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.lib.db import get_db
from app.schemas.user import UserResponse, UserUpdate
from app.schemas.auth import CourseEnrollmentRequest
from app.services.user_service import (
    get_all_users,
    get_anonymous_users,
    get_user_by_id,
    get_user_by_email,
    update_user,
    delete_user,
    enroll_user_in_course
)
from app.utils.jwt import get_current_user
from app.api.exam import require_role # Import require_role
from app.models.user import User # Import User model to define current_user type

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.post("/enroll", status_code=status.HTTP_201_CREATED)
async def enroll_user_in_course_endpoint(
    enrollment_data: CourseEnrollmentRequest = Body(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "MODERATOR"]))
):
    """Admin endpoint to enroll a user in a course"""
    user_id = enrollment_data.user_id
    course_id = enrollment_data.course_id
    return await enroll_user_in_course(db, user_id, course_id)


@router.get("/", response_model=List[UserResponse])
async def list_users(
    skip: int = 0, 
    limit: int = 100, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all users with pagination
    
    - **skip**: Number of records to skip (default: 0)
    - **limit**: Maximum number of records to return (default: 100)
    
    Requires authentication
    """
    users = await get_all_users(db, skip=skip, limit=limit)
    return users


@router.get("/anonymous", response_model=List[UserResponse])
async def list_anonymous_users(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "MODERATOR"]))
):
    """
    Get anonymous users with pagination (admin/moderator only)
    """
    users = await get_anonymous_users(db, skip=skip, limit=limit)
    return users


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """
    Get current logged-in user's profile
    
    Requires authentication
    """
    return current_user


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific user by ID
    
    - **user_id**: The ID of the user to retrieve
    
    Requires authentication
    """
    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found"
        )
    return user


@router.get("/email/{email}", response_model=UserResponse)
async def get_user_by_email_endpoint(
    email: str, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a user by email address
    
    - **email**: The email address of the user
    
    Requires authentication
    """
    user = await get_user_by_email(db, email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with email {email} not found"
        )
    return user


@router.put("/{user_id}", response_model=UserResponse)
async def update_user_endpoint(
    user_id: int,
    user_update: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update user information
    
    - **user_id**: The ID of the user to update
    - All fields are optional - only provided fields will be updated
    
    Requires authentication
    """
    user = await update_user(db, user_id, user_update)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found"
        )
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_endpoint(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a user
    
    - **user_id**: The ID of the user to delete
    
    Requires authentication and admin privileges
    """
    success = await delete_user(db, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found"
        )
    return None
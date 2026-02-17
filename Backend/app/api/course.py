# Backend/app/api/course.py
from fastapi import APIRouter, Depends, Query, HTTPException, Body
from app.services.course_service import (
    get_all_courses_service, 
    create_course_service, 
    get_course_service, 
    update_course_service, 
    delete_course_service,
    get_course_exams_service,
    get_course_students_service,
    remove_user_from_course_service,
)
from app.services.user_service import enroll_user_in_course
from app.schemas.course import CourseCreate, CourseUpdate, CourseResponse
from app.schemas.exam import ExamResponse 
from app.schemas.user import UserResponse
from app.schemas.auth import CourseEnrollmentRequest
from sqlalchemy.ext.asyncio import AsyncSession

from app.lib.db import get_db
from app.utils.jwt import get_current_user
from app.models.user import User
from typing import Optional, List
from app.api.exam import require_role


router = APIRouter(
    prefix="/api/courses",  # ✅ FIXED: /api/course → /api/courses
    tags=["Course"]
)

# ✅ Make public - no authentication required
@router.get("/", response_model=list[CourseResponse])
async def get_all_courses(
    db: AsyncSession = Depends(get_db)
):
    """Get all courses - public endpoint"""
    return await get_all_courses_service(db, user_id=None)


@router.post("/")
async def create_course(
    course: CourseCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)  # Only authenticated users
):
    return await create_course_service(course, db)


@router.get("/{course_id}", response_model=CourseResponse)
async def get_course(course_id: int, db: AsyncSession = Depends(get_db)):
    """Get single course - public endpoint"""
    return await get_course_service(course_id, db)


@router.get("/{course_id}/exams", response_model=List[ExamResponse])
async def get_course_exams(
    course_id: int, 
    db: AsyncSession = Depends(get_db)
):
    """Get all exams for a specific course - public endpoint"""
    return await get_course_exams_service(course_id, db)


@router.get("/{course_id}/with-exams")
async def get_course_with_exams(course_id: int, db: AsyncSession = Depends(get_db)):
    return await get_course_service(course_id, db)


@router.put("/{course_id}")
async def update_course(
    course_id: int, 
    course: CourseUpdate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await update_course_service(course_id, course, db)


@router.delete("/{course_id}")
async def delete_course(
    course_id: int, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await delete_course_service(course_id, db)


@router.get("/{course_id}/students", response_model=List[UserResponse])
async def list_course_students(
    course_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "MODERATOR"]))
):
    """List enrolled students for a course (admin/moderator only)."""
    return await get_course_students_service(course_id, db)


@router.post("/{course_id}/students", status_code=201)
async def enroll_student_to_course(
    course_id: int,
    enrollment_data: CourseEnrollmentRequest = Body(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "MODERATOR"]))
):
    """Enroll a user into a course (admin/moderator only)."""
    if enrollment_data.course_id and enrollment_data.course_id != course_id:
        raise HTTPException(status_code=400, detail="course_id mismatch")
    return await enroll_user_in_course(db, enrollment_data.user_id, course_id)


@router.delete("/{course_id}/students/{user_id}")
async def remove_student_from_course(
    course_id: int,
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "MODERATOR"]))
):
    """Remove a user from a course (admin/moderator only)."""
    return await remove_user_from_course_service(course_id, user_id, db)
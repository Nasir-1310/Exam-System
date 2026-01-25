<<<<<<< HEAD
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends
from app.services.course_service import *
from app.schemas.course import *
=======
# Backend/app/api/course.py
from fastapi import APIRouter, Depends, Query, HTTPException
from app.services.course_service import (
    get_all_courses_service, 
    create_course_service, 
    get_course_service, 
    update_course_service, 
    delete_course_service,
    get_course_exams_service 
)
from app.schemas.course import CourseCreate, CourseUpdate, CourseResponse
from app.schemas.exam import ExamResponse 
from sqlalchemy.orm import Session
>>>>>>> origin/nasir
from app.lib.db import get_db
from app.utils.jwt import get_current_user
from app.models.user import User
from typing import Optional, List


router = APIRouter(
    prefix="/api/courses",  # ✅ FIXED: /api/course → /api/courses
    tags=["Course"]
)

# ✅ Make public - no authentication required
@router.get("/", response_model=list[CourseResponse])
<<<<<<< HEAD
async def get_all_courses(db: AsyncSession = Depends(get_db)):
	return await get_all_courses_service(db)


@router.post("/")
async def create_course(course: CourseCreate, db: AsyncSession = Depends(get_db)):
	return await create_course_service(course, db)


@router.get("/{course_id}", response_model=CourseResponse)
async def get_course(course_id: int, db: AsyncSession = Depends(get_db)):
	return await get_course_service(course_id, db)
=======
async def get_all_courses(
    db: Session = Depends(get_db)
):
    """Get all courses - public endpoint"""
    return await get_all_courses_service(db, user_id=None)


@router.post("/")
async def create_course(
    course: CourseCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # Only authenticated users
):
    return await create_course_service(course, db)


@router.get("/{course_id}", response_model=CourseResponse)
async def get_course(course_id: int, db: Session = Depends(get_db)):
    """Get single course - public endpoint"""
    return await get_course_service(course_id, db)


@router.get("/{course_id}/exams", response_model=List[ExamResponse])
async def get_course_exams(
    course_id: int, 
    db: Session = Depends(get_db)
):
    """Get all exams for a specific course - public endpoint"""
    return await get_course_exams_service(course_id, db)
>>>>>>> origin/nasir


@router.get("/{course_id}/with-exams")
async def get_course_with_exams(course_id: int, db: AsyncSession = Depends(get_db)):
    return await get_course_service(course_id, db)


@router.put("/{course_id}")
<<<<<<< HEAD
async def update_course(course_id: int, course: CourseUpdate, db: AsyncSession = Depends(get_db)):
	return await update_course_service(course_id, course, db)


@router.delete("/{course_id}")
async def delete_course(course_id: int, db: AsyncSession = Depends(get_db)):
	return await delete_course_service(course_id, db)

=======
async def update_course(
    course_id: int, 
    course: CourseUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await update_course_service(course_id, course, db)


@router.delete("/{course_id}")
async def delete_course(
    course_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await delete_course_service(course_id, db)
>>>>>>> origin/nasir

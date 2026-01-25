# Backend/app/services/course_service.py
from app.models import Course, UserCourseRelation, Exam
from sqlalchemy import select, join, or_
from app.schemas import (
    CourseCreate, 
    CourseUpdate
)
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status


async def get_all_courses_service(db: AsyncSession, user_id: Optional[int]) -> List[Course]:
    """Get all courses, optionally filtered by user enrollment"""
    query = select(Course).where(
        or_(Course.is_deleted == False, Course.is_deleted.is_(None))
    )
    
    if user_id is not None:
        query = query.join(
            UserCourseRelation, 
            UserCourseRelation.c.Course_id == Course.id
        ).where(UserCourseRelation.c.User_id == user_id)
    
    result = await db.execute(query)
    courses = result.scalars().unique().all()
    return courses


async def create_course_service(course: CourseCreate, db: AsyncSession) -> Course:
    """Create course"""
    course_obj = Course(**course.model_dump())
    db.add(course_obj)
    await db.commit()
    await db.refresh(course_obj)
    return course_obj


async def get_course_service(course_id: int, db: AsyncSession) -> Course:
    """Get course by ID"""
    result = await db.execute(
        select(Course).where(
            Course.id == course_id,
            or_(Course.is_deleted == False, Course.is_deleted.is_(None))
        )
    )
    course = result.scalars().first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    return course


async def get_course_exams_service(course_id: int, db: AsyncSession) -> List[Exam]:
    """Get all exams for a specific course"""
    course = await get_course_service(course_id, db)
    
    # ✅ FIXED: Handle NULL values properly
    result = await db.execute(
        select(Exam).where(
            Exam.course_id == course_id,
            or_(Exam.is_deleted == False, Exam.is_deleted.is_(None)),
            or_(Exam.is_active == True, Exam.is_active.is_(None))
        ).options(selectinload(Exam.questions))
    )
    exams = result.scalars().all()
    
    # Debug log
    print(f"[DEBUG] Found {len(exams)} exams for course {course_id}")
    
    return exams


async def update_course_service(course_id: int, course_update: CourseUpdate, db: AsyncSession) -> Course:
    """Update course details"""
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalars().first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    update_data = course_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(course, field, value)
    
    await db.commit()
    await db.refresh(course)
    return course


async def delete_course_service(course_id: int, db: AsyncSession) -> bool:
    """Delete course (soft delete)"""
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalars().first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    
    course.is_deleted = True
    await db.commit()
    return True
from fastapi import HTTPException, status
from app.models import Course
from app.schemas import (
    CourseCreate, 
    CourseUpdate
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List


async def get_all_courses_service(db: AsyncSession) -> List[Course]:
    result = await db.execute(select(Course))
    return result.scalars().all()


async def create_course_service(course_data: CourseCreate, db: AsyncSession) -> Course:
    course = Course(**course_data.model_dump())
    db.add(course)
    await db.commit()
    await db.refresh(course)
    return course


async def get_course_service(course_id: int, db: AsyncSession) -> Course:
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course with id {course_id} not found"
        )
    return course


async def update_course_service(course_id: int, course_data: CourseUpdate, db: AsyncSession) -> Course:
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    update_data = course_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(course, key, value)
    
    await db.commit()
    await db.refresh(course)
    return course


async def delete_course_service(course_id: int, db: AsyncSession) -> bool:
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
        
    await db.delete(course)
    await db.commit()
    return True
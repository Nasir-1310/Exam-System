from app.models import Course, UserCourseRelation
from sqlalchemy import select, join
from app.schemas import (
    CourseCreate, 
    CourseUpdate
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from sqlalchemy.orm import selectinload # Import selectinload


async def get_all_courses_service(db: AsyncSession, user_id: Optional[int]) -> List[Course]:
    """Get all courses, optionally filtered by user enrollment"""
    query = select(Course)
    print(f"[DEBUG] get_all_courses_service - Initial query: {query}")

    if user_id is not None:
        # For specific user (e.g., dashboard), show enrolled courses
        # Use outerjoin to fetch all courses and mark if user is enrolled
        query = query.join(UserCourseRelation, UserCourseRelation.c.Course_id == Course.id).where(UserCourseRelation.c.User_id == user_id)
        print(f"[DEBUG] get_all_courses_service - Query with user_id {user_id}: {query}")
    
    # If user_id is None (for general /courses page), fetch all courses
    # No additional filters needed here for general listing.

    result = await db.execute(query)
    courses = result.scalars().unique().all()
    print(f"[DEBUG] get_all_courses_service - Fetched {len(courses)} courses.")
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
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalars().first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    return course


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
    """Delete course"""
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalars().first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    
    await db.delete(course)
    await db.commit()
    return True
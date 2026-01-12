from app.models import Course
from app.schemas import (
    CourseCreate, 
    CourseUpdate
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List


async def get_all_courses_service(db: AsyncSession) -> List[Course]:
	return await db.execute(select(Course))


async def create_course_service(course: CourseCreate, db: AsyncSession) -> Course:
	course = Course(**course.dict())
	await db.add(course)
	await db.commit()
	return course


async def get_course_service(course_id: int, db: AsyncSession) -> Course:
	return await db.execute(select(Course).where(Course.id == course_id))


async def update_course_service(course_id: int, course: CourseUpdate, db: AsyncSession) -> Course:
	course = await db.execute(select(Course).where(Course.id == course_id))
	course.update(course.dict())
	await db.commit()
	return course


async def delete_course_service(course_id: int, db: AsyncSession) -> Course:
	course = await db.execute(select(Course).where(Course.id == course_id))
	await db.delete(course)
	await db.commit()
	return course
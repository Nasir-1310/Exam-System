from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends
from app.services.course_service import *
from app.schemas.course import *
from app.lib.db import get_db


router = APIRouter(
    prefix="/api/course",
    tags=["Course"]
)

@router.get("/", response_model=list[CourseResponse])
async def get_all_courses(db: AsyncSession = Depends(get_db)):
	return await get_all_courses_service(db)


@router.post("/")
async def create_course(course: CourseCreate, db: AsyncSession = Depends(get_db)):
	return await create_course_service(course, db)


@router.get("/{course_id}", response_model=CourseResponse)
async def get_course(course_id: int, db: AsyncSession = Depends(get_db)):
	return await get_course_service(course_id, db)


@router.get("/{course_id}/with-exams")
async def get_course_with_exams(course_id: int, db: AsyncSession = Depends(get_db)):
    return await get_course_service(course_id, db)


@router.put("/{course_id}")
async def update_course(course_id: int, course: CourseUpdate, db: AsyncSession = Depends(get_db)):
	return await update_course_service(course_id, course, db)


@router.delete("/{course_id}")
async def delete_course(course_id: int, db: AsyncSession = Depends(get_db)):
	return await delete_course_service(course_id, db)


from fastapi import APIRouter, Depends, Query
from app.services.course_service import get_all_courses_service, create_course_service, get_course_service, update_course_service, delete_course_service
from app.schemas.course import CourseCreate, CourseUpdate, CourseResponse
from sqlalchemy.orm import Session
from app.lib.db import get_db
from app.utils.jwt import get_current_user
from app.models.user import User
from typing import Optional # Import Optional


router = APIRouter(
    prefix="/api/course",
    tags=["Course"]
)

@router.get("/", response_model=list[CourseResponse])
async def get_all_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    user_id_filter: Optional[int] = Query(None, description="Filter courses by user ID for enrollment status. If not provided, returns all courses.")
):
    # For admin/moderator, or if no specific user_id_filter is provided, return all courses.
    if current_user.role in ["ADMIN", "MODERATOR"] or user_id_filter is None:
        return await get_all_courses_service(db, user_id=None) # No user-specific filter
    
    # For regular users requesting their enrolled courses
    return await get_all_courses_service(db, user_id=user_id_filter)


@router.post("/")
async def create_course(course: CourseCreate, db: Session = Depends(get_db)):
	return await create_course_service(course, db)


@router.get("/{course_id}", response_model=CourseResponse)
async def get_course(course_id: int, db: Session = Depends(get_db)):
	return await get_course_service(course_id, db)


@router.put("/{course_id}")
async def update_course(course_id: int, course: CourseUpdate, db: Session = Depends(get_db)):
	return await update_course_service(course_id, course, db)


@router.delete("/{course_id}")
async def delete_course(course_id: int, db: Session = Depends(get_db)):
	return await delete_course_service(course_id, db)


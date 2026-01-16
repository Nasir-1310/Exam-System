# Backend/app/api/exam.py
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from fastapi.security import HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.exam_service import *
from app.schemas.exam import *
from app.lib.db import get_db
from app.utils.jwt import get_current_user
from app.models.user import User


def require_role(allowed_roles: list[str]):
    """Dependency to check if user has required role"""
    async def check_role(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return current_user
    return check_role


router = APIRouter(
    prefix="/api/exam",
    tags=["Exam"]
)


@router.get("/", response_model=list[ExamResponse])
async def get_all_exams(db: AsyncSession = Depends(get_db),):
	res = await get_all_exams_service(db)
	return res


@router.post("/")
async def create_exam(exam: ExamCreateRequest, db: AsyncSession = Depends(get_db)):
	res = await create_exam_service(exam, db)
	return res


@router.post("/{exam_id}/add-question", status_code=status.HTTP_201_CREATED)
async def add_question_to_exam(
    exam_id: int,
    question: QuestionCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "MODERATOR"]))
):
    """Add a single question to existing exam"""
    result = await add_question_to_exam_service(db, exam_id, question)
    return {
        "message": "Question added successfully",
        "question_id": result.id
    }

@router.post("/{exam_id}/mcq-bulk-entry", status_code=status.HTTP_201_CREATED)
async def add_mcq_bulk_to_exam(exam_id: int, question_request: MCQBulkRequest, db: AsyncSession = Depends(get_db)):
	res = await add_mcq_bulk_to_exam_service(db, exam_id, question_request)
	return res

@router.post("/{exam_id}/mcq-docx-upload", status_code=status.HTTP_201_CREATED, response_model=list[QuestionResponse])
async def upload_exam_docx(exam_id: int, file: Annotated[UploadFile, File(...)], db: AsyncSession = Depends(get_db)):
	res = await upload_mcq_docx_to_exam_service(db, exam_id, file)
	return res


@router.get("/{exam_id}", response_model=ExamResponse)
async def get_exam(exam_id: int, db: AsyncSession = Depends(get_db)):
	res = await get_exam_service(exam_id, db)
	return res


@router.put("/{exam_id}")
async def update_exam(exam_id: int, exam: ExamUpdateRequest, db: AsyncSession = Depends(get_db)):
	return await update_exam_service(exam_id, exam, db)


@router.delete("/{exam_id}")
async def delete_exam(exam_id: int, db: AsyncSession = Depends(get_db)):
	return await delete_exam_service(exam_id, db)


# ============= এইখানে নতুন 2টি route add করুন =============

# ADDED: প্রশ্ন সম্পাদনা করার API
@router.put("/{exam_id}/questions/{question_id}", status_code=status.HTTP_200_OK)
async def update_question(
    exam_id: int,
    question_id: int,
    question: QuestionCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "MODERATOR"]))
):
    """Update a specific question in an exam"""
    result = await update_question_service(db, exam_id, question_id, question)
    return result


# ADDED: প্রশ্ন মুছে ফেলার API
@router.delete("/{exam_id}/questions/{question_id}", status_code=status.HTTP_200_OK)
async def delete_question(
    exam_id: int,
    question_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "MODERATOR"]))
):
    """Delete a specific question from an exam"""
    result = await delete_question_service(db, exam_id, question_id)
    return result


@router.post("/submit", response_model=ResultDetailedResponse)
async def submit_exam(submission: ExamSubmitRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
	return await submit_exam_service(submission, db, current_user.id)
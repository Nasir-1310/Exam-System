# Backend/app/api/exam.py
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session
from typing import List, Optional # Added Optional
from app.services.exam_service import get_all_exams_service, create_exam_service, add_question_to_exam_service, add_mcq_bulk_to_exam_service, get_exam_service, update_exam_service, delete_exam_service, update_question_service, delete_question_service, submit_exam_service, get_detailed_exam_result_service
from app.services.google_drive_service import google_drive_service
from app.schemas.exam import ExamCreateRequest, ExamResponse, ExamUpdateRequest, MCQBulkRequest, QuestionCreateRequest
from app.schemas.result import ResultResponse, ResultDetailedResponse, AnswerCreate
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
async def get_all_exams(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    course_id: Optional[int] = Query(None)
):
    if current_user.role in ["ADMIN", "MODERATOR"] :
        return await get_all_exams_service(db, user_id=None, course_id=None)
    return await get_all_exams_service(db, user_id=current_user.id, course_id=course_id)


@router.post("/")
async def create_exam(exam: ExamCreateRequest, db: Session = Depends(get_db)):
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

@router.post("/{exam_id}/mcq-bulk")
async def add_mcq_bulk_to_exam(exam_id: int, question_request: MCQBulkRequest, db: Session = Depends(get_db)):
	res = await add_mcq_bulk_to_exam_service(exam_id, question_request, db)
	return res


@router.get("/{exam_id}", response_model=ExamResponse)
async def get_exam(
    exam_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role in ["ADMIN", "MODERATOR"]:
        return await get_exam_service(exam_id, user_id=None, db=db)
    return await get_exam_service(exam_id, current_user.id, db)


@router.put("/{exam_id}")
async def update_exam(
    exam_id: int,
    exam: ExamUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "MODERATOR"]))
):
	return await update_exam_service(exam_id, exam, db)


@router.delete("/{exam_id}")
async def delete_exam(exam_id: int, db: Session = Depends(get_db)):
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


@router.post("/{exam_id}/submit", response_model=ResultResponse)
async def submit_exam(
    exam_id: int,
    answers: List[AnswerCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await submit_exam_service(db, exam_id, current_user.id, answers)


@router.get("/{exam_id}/result/details", response_model=ResultDetailedResponse)
async def get_detailed_exam_result(
    exam_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await get_detailed_exam_result_service(db, exam_id, current_user.id)


@router.post("/upload-image")
async def upload_image_to_drive(
    file: UploadFile = File(...),
    current_user: User = Depends(require_role(["ADMIN", "MODERATOR"]))
):
    """
    Upload image to Google Drive and return shareable link
    """
    try:
        # Read file content
        file_content = await file.read()

        # Upload to Google Drive (mock implementation)
        shareable_link = await google_drive_service.upload_image(
            file_content,
            file.filename,
            file.content_type
        )

        if not shareable_link:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to upload image to Google Drive"
            )

        return {
            "success": True,
            "shareable_link": shareable_link,
            "direct_link": google_drive_service.get_direct_image_url(shareable_link),
            "filename": file.filename
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Image upload failed: {str(e)}"
        )
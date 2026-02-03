# Backend/app/api/exam.py

from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form, Request
from fastapi import Body
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated
import os
import shutil
import uuid
from typing import List, Optional
from app.services.exam_service import (
    get_all_exams_service, 
    create_exam_service, 
    add_question_to_exam_service, 
    add_mcq_bulk_to_exam_service, 
    get_exam_service, 
    update_exam_service, 
    delete_exam_service, 
    update_question_service, 
    delete_question_service, 
    submit_exam_service, 
    submit_exam_anonymous_service,
    get_detailed_exam_result_service,
    get_detailed_exam_result_anonymous_service
)
from app.services.google_drive_service import google_drive_service
from app.schemas.exam import ExamCreateRequest, ExamResponse, ExamUpdateRequest, MCQBulkRequest, QuestionCreateRequest
from app.schemas.result import ResultResponse, ResultDetailedResponse, AnswerCreate, AnonymousExamSubmitRequest

from app.lib.db import get_db
from app.utils.jwt import get_current_user
from app.models.user import User
from app.schemas.question import QuestionResponse


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
    prefix="/api/exams",  # ✅ CHANGED: /api/exam → /api/exams
    tags=["Exam"]
)


# ✅ PUBLIC - Anyone can see exams
@router.get("/", response_model=list[ExamResponse])
async def get_all_exams(
    db: AsyncSession = Depends(get_db),
    course_id: Optional[int] = Query(None)
):
    """Get all exams - public endpoint"""
    return await get_all_exams_service(db, user_id=None, course_id=course_id)


# ✅ ADMIN/MODERATOR only
@router.post("/")
async def create_exam(
    exam: ExamCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "MODERATOR"]))
):
    """Create new exam"""
    res = await create_exam_service(exam, db)
    return res


# ✅ ADMIN/MODERATOR only
@router.post("/{exam_id}/add-question", status_code=status.HTTP_201_CREATED)
async def add_question_to_exam(
    exam_id: int,
    request: Request,
    # Multipart form fields (optional)
    q_type: Optional[str] = Form(None),
    content: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    option_a: Optional[str] = Form(None),
    option_b: Optional[str] = Form(None),
    option_c: Optional[str] = Form(None),
    option_d: Optional[str] = Form(None),
    answer: Optional[str] = Form(None),
    image: UploadFile = File(None),
    option_a_img: UploadFile = File(None),
    option_b_img: UploadFile = File(None),
    option_c_img: UploadFile = File(None),
    option_d_img: UploadFile = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "MODERATOR"]))
):
    """Add a single question to existing exam.

    Supports:
    - Pure JSON (send QuestionCreateRequest in body)
    - Multipart form with text fields + optional image files
    """

    def save_image(file: UploadFile | None):
        if not file:
            return None
        uploads_dir = os.path.join(os.path.dirname(__file__), "../../public/uploads/questions")
        os.makedirs(uploads_dir, exist_ok=True)
        ext = os.path.splitext(file.filename or "")[1] or ".jpg"
        filename = f"{uuid.uuid4().hex}{ext}"
        file_path = os.path.join(uploads_dir, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return f"/public/uploads/questions/{filename}"

    content_type = request.headers.get("content-type", "").lower()
    question: QuestionCreateRequest

    if content_type.startswith("application/json"):
        payload = await request.json()
        try:
            question = QuestionCreateRequest(**payload)
        except Exception as exc:  # validation errors
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    else:
        if not q_type or not content:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="q_type and content are required")

        question = QuestionCreateRequest(
            q_type=q_type,
            content=content,
            image_url=None,
            description=description,
            option_a=option_a,
            option_b=option_b,
            option_c=option_c,
            option_d=option_d,
            answer=answer,
            option_a_image_url=None,
            option_b_image_url=None,
            option_c_image_url=None,
            option_d_image_url=None,
        )

    # If files provided, override image URLs with saved paths
    if image:
        question.image_url = save_image(image)
    if option_a_img:
        question.option_a_image_url = save_image(option_a_img)
    if option_b_img:
        question.option_b_image_url = save_image(option_b_img)
    if option_c_img:
        question.option_c_image_url = save_image(option_c_img)
    if option_d_img:
        question.option_d_image_url = save_image(option_d_img)

    result = await add_question_to_exam_service(db, exam_id, question)
    print("Added question result:", result)
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

# ✅ ADMIN/MODERATOR only
@router.post("/{exam_id}/mcq-bulk")
async def add_mcq_bulk_to_exam(
    exam_id: int, 
    question_request: MCQBulkRequest, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "MODERATOR"]))
):
    """Add multiple MCQ questions in bulk"""
    res = await add_mcq_bulk_to_exam_service(exam_id, question_request, db)
    return res


# ✅ PUBLIC - Anyone can view exam details (but not answers)
@router.get("/{exam_id}", response_model=ExamResponse)
async def get_exam(
    exam_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get exam details - public endpoint"""
    return await get_exam_service(exam_id, user_id=None, db=db)


# ✅ ADMIN/MODERATOR only
@router.put("/{exam_id}")
async def update_exam(
    exam_id: int,
    exam: ExamUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "MODERATOR"]))
):
    """Update exam details"""
    return await update_exam_service(exam_id, exam, db)



# ✅ ADMIN/MODERATOR only
@router.delete("/{exam_id}")
async def delete_exam(
    exam_id: int, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "MODERATOR"]))
):
    """Delete exam"""
    return await delete_exam_service(exam_id, db)


# ✅ ADMIN/MODERATOR only - Update question
@router.put("/{exam_id}/questions/{question_id}", status_code=status.HTTP_200_OK)
async def update_question(
    exam_id: int,
    question_id: int,
    question: QuestionCreateRequest = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "MODERATOR"])),
    image: UploadFile = File(None),
    option_a_img: UploadFile = File(None),
    option_b_img: UploadFile = File(None),
    option_c_img: UploadFile = File(None),
    option_d_img: UploadFile = File(None)
):
    """Update a specific question in an exam, with optional image uploads"""
    def save_image(file):
        if file:
            public_dir = os.path.join(os.path.dirname(__file__), "../../public")
            os.makedirs(public_dir, exist_ok=True)
            file_path = os.path.join(public_dir, file.filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            return f"/public/{file.filename}"
        return None

    question.image = save_image(image)
    question.option_a_img = save_image(option_a_img)
    question.option_b_img = save_image(option_b_img)
    question.option_c_img = save_image(option_c_img)
    question.option_d_img = save_image(option_d_img)

    result = await update_question_service(db, exam_id, question_id, question)
    return result


# ✅ ADMIN/MODERATOR only - Delete question
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


# ✅ AUTHENTICATED users only - Submit exam
@router.post("/{exam_id}/submit", response_model=ResultResponse)
async def submit_exam(
    exam_id: int,
    answers: List[AnswerCreate],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit exam answers"""
    return await submit_exam_service(db, exam_id, current_user.id, answers)


# ✅ PUBLIC - Anonymous submit (creates/fetches an anonymous user)
@router.post("/{exam_id}/submit/anonymous", response_model=ResultResponse)
@router.post("/{exam_id}/submit/anonymous/", response_model=ResultResponse)
async def submit_exam_anonymous(
    exam_id: int,
    payload: AnonymousExamSubmitRequest,
    db: AsyncSession = Depends(get_db)
):
    return await submit_exam_anonymous_service(
        db,
        exam_id,
        name=payload.name,
        email=payload.email,
        active_mobile=payload.active_mobile,
        answers=payload.answers
    )


# ✅ AUTHENTICATED users only - Get result
@router.get("/{exam_id}/result/details", response_model=ResultDetailedResponse)
async def get_detailed_exam_result(
    exam_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detailed exam result"""
    return await get_detailed_exam_result_service(db, exam_id, current_user.id)


# ✅ PUBLIC - Get result for anonymous user by email
@router.get("/{exam_id}/result/details/anonymous", response_model=ResultDetailedResponse)
async def get_detailed_exam_result_anonymous(
    exam_id: int,
    email: str = Query(..., description="Email used for anonymous submission"),
    db: AsyncSession = Depends(get_db)
):
    """Fetch latest result for an anonymous user via email."""
    return await get_detailed_exam_result_anonymous_service(db, exam_id, email)


# ✅ ADMIN/MODERATOR only - Upload image
@router.post("/upload-image")
async def upload_image_to_drive(
    file: UploadFile = File(...),
    current_user: User = Depends(require_role(["ADMIN", "MODERATOR"]))
):
    """Upload image to Google Drive and return shareable link"""
    try:
        file_content = await file.read()

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
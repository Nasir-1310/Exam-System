# Backend/app/api/exam.py
<<<<<<< HEAD
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from fastapi.security import HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.exam_service import *
from app.schemas.exam import *
=======
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session
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
    get_detailed_exam_result_service
)
from app.services.google_drive_service import google_drive_service
from app.schemas.exam import ExamCreateRequest, ExamResponse, ExamUpdateRequest, MCQBulkRequest, QuestionCreateRequest
from app.schemas.result import ResultResponse, ResultDetailedResponse, AnswerCreate
>>>>>>> origin/nasir
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
    prefix="/api/exams",  # ✅ CHANGED: /api/exam → /api/exams
    tags=["Exam"]
)


# ✅ PUBLIC - Anyone can see exams
@router.get("/", response_model=list[ExamResponse])
<<<<<<< HEAD
async def get_all_exams(db: AsyncSession = Depends(get_db),):
	res = await get_all_exams_service(db)
	return res
=======
async def get_all_exams(
    db: Session = Depends(get_db),
    course_id: Optional[int] = Query(None)
):
    """Get all exams - public endpoint"""
    return await get_all_exams_service(db, user_id=None, course_id=course_id)
>>>>>>> origin/nasir


# ✅ ADMIN/MODERATOR only
@router.post("/")
<<<<<<< HEAD
async def create_exam(exam: ExamCreateRequest, db: AsyncSession = Depends(get_db)):
	res = await create_exam_service(exam, db)
	return res
=======
async def create_exam(
    exam: ExamCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "MODERATOR"]))
):
    """Create new exam"""
    res = await create_exam_service(exam, db)
    return res
>>>>>>> origin/nasir


# ✅ ADMIN/MODERATOR only
@router.post("/{exam_id}/add-question", status_code=status.HTTP_201_CREATED)
async def add_question_to_exam(
    exam_id: int,
    question: QuestionCreateRequest = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "MODERATOR"])),
    image: UploadFile = File(None),
    option_a_img: UploadFile = File(None),
    option_b_img: UploadFile = File(None),
    option_c_img: UploadFile = File(None),
    option_d_img: UploadFile = File(None)
):
    """Add a single question to existing exam, with optional image uploads"""
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

    result = await add_question_to_exam_service(db, exam_id, question)
    return {
        "message": "Question added successfully",
        "question_id": result.id
    }

<<<<<<< HEAD
@router.post("/{exam_id}/mcq-bulk-entry", status_code=status.HTTP_201_CREATED)
async def add_mcq_bulk_to_exam(exam_id: int, question_request: MCQBulkRequest, db: AsyncSession = Depends(get_db)):
	res = await add_mcq_bulk_to_exam_service(db, exam_id, question_request)
	return res

@router.post("/{exam_id}/mcq-docx-upload", status_code=status.HTTP_201_CREATED, response_model=list[QuestionResponse])
async def upload_exam_docx(exam_id: int, file: Annotated[UploadFile, File(...)], db: AsyncSession = Depends(get_db)):
	res = await upload_mcq_docx_to_exam_service(db, exam_id, file)
	return res
=======

# ✅ ADMIN/MODERATOR only
@router.post("/{exam_id}/mcq-bulk")
async def add_mcq_bulk_to_exam(
    exam_id: int, 
    question_request: MCQBulkRequest, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "MODERATOR"]))
):
    """Add multiple MCQ questions in bulk"""
    res = await add_mcq_bulk_to_exam_service(exam_id, question_request, db)
    return res
>>>>>>> origin/nasir


# ✅ PUBLIC - Anyone can view exam details (but not answers)
@router.get("/{exam_id}", response_model=ExamResponse)
<<<<<<< HEAD
async def get_exam(exam_id: int, db: AsyncSession = Depends(get_db)):
	res = await get_exam_service(exam_id, db)
	return res
=======
async def get_exam(
    exam_id: int,
    db: Session = Depends(get_db)
):
    """Get exam details - public endpoint"""
    return await get_exam_service(exam_id, user_id=None, db=db)
>>>>>>> origin/nasir


# ✅ ADMIN/MODERATOR only
@router.put("/{exam_id}")
<<<<<<< HEAD
async def update_exam(exam_id: int, exam: ExamUpdateRequest, db: AsyncSession = Depends(get_db)):
	return await update_exam_service(exam_id, exam, db)
=======
async def update_exam(
    exam_id: int,
    exam: ExamUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "MODERATOR"]))
):
    """Update exam details"""
    return await update_exam_service(exam_id, exam, db)
>>>>>>> origin/nasir


# ✅ ADMIN/MODERATOR only
@router.delete("/{exam_id}")
<<<<<<< HEAD
async def delete_exam(exam_id: int, db: AsyncSession = Depends(get_db)):
	return await delete_exam_service(exam_id, db)
=======
async def delete_exam(
    exam_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "MODERATOR"]))
):
    """Delete exam"""
    return await delete_exam_service(exam_id, db)
>>>>>>> origin/nasir


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


<<<<<<< HEAD
@router.post("/submit", response_model=ResultDetailedResponse)
async def submit_exam(submission: ExamSubmitRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
	return await submit_exam_service(submission, db, current_user.id)
=======
# ✅ AUTHENTICATED users only - Submit exam
@router.post("/{exam_id}/submit", response_model=ResultResponse)
async def submit_exam(
    exam_id: int,
    answers: List[AnswerCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit exam answers"""
    return await submit_exam_service(db, exam_id, current_user.id, answers)


# ✅ AUTHENTICATED users only - Get result
@router.get("/{exam_id}/result/details", response_model=ResultDetailedResponse)
async def get_detailed_exam_result(
    exam_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detailed exam result"""
    return await get_detailed_exam_result_service(db, exam_id, current_user.id)


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
>>>>>>> origin/nasir

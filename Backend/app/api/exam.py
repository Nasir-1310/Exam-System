from fastapi import APIRouter, Depends
from app.services.exam_service import *
from app.schemas.exam import *
from sqlalchemy.orm import Session
from app.lib.db import get_db


router = APIRouter(
    prefix="/api/exam",
    tags=["Exam"]
)


@router.get("/", response_model=list[ExamResponse])
async def get_all_exams(db: Session = Depends(get_db),):
	res = await get_all_exams_service(db)
	return res


@router.post("/")
async def create_exam(exam: ExamCreateRequest, db: Session = Depends(get_db)):
	res = await create_exam_service(exam, db)
	return res


@router.post("/{exam_id}/add-question")
async def add_question_to_exam(exam_id: int, question: QuestionCreateRequest, db: Session = Depends(get_db)):
	res = await add_question_to_exam_service(exam_id, question, db)
	return res

@router.post("/{exam_id}/mcq-bulk")
async def add_mcq_bulk_to_exam(exam_id: int, question_request: MCQBulkRequest, db: Session = Depends(get_db)):
	res = await add_mcq_bulk_to_exam_service(exam_id, question_request, db)
	return res


@router.get("/{exam_id}", response_model=ExamResponse)
async def get_exam(exam_id: int, db: Session = Depends(get_db)):
	res = await get_exam_service(exam_id, db)
	return res


@router.put("/{exam_id}")
async def update_exam(exam_id: int, exam: ExamUpdateRequest, db: Session = Depends(get_db)):
	return update_exam_service(exam_id, exam, db)


@router.delete("/{exam_id}")
async def delete_exam(exam_id: int, db: Session = Depends(get_db)):
	return delete_exam_service(exam_id, db)


@router.post("/{exam_id}/submit")
async def submit_exam(exam_id: int, answers: list[int], db: Session = Depends(get_db)):
	return submit_exam_service(exam_id, answers, db)

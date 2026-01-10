from app.models import Exam
from app.schemas import ExamCreateRequest, ExamUpdateRequest, QuestionCreateRequest
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List


async def get_all_exams_service(db: AsyncSession) -> List[Exam]:
	return await db.execute(select(Exam))


async def add_question_to_exam_service(db: AsyncSession, exam_id: int, question: QuestionCreateRequest):
    exam = await db.execute(select(Exam).where(Exam.id == exam_id))
    question = Question(**question.dict()) 
    await db.add(question)
    exam.questions.append(question)
    await db.commit()
    return exam


async def create_exam_service(exam: ExamCreateRequest, db: AsyncSession) -> Exam:
    questions = exam.questions
    for question in questions:
        await add_question_to_exam_service(db, exam.id, question)
    exam = Exam(**exam.dict())
    await db.add(exam)
    await db.commit()
    return exam


async def get_exam_service(exam_id: int, db: AsyncSession) -> Exam:
	return await db.execute(select(Exam).where(Exam.id == exam_id))


async def update_exam_service(exam_id: int, exam: ExamUpdateRequest, db: AsyncSession) -> Exam:
	exam = await db.execute(select(Exam).where(Exam.id == exam_id))
	exam.update(exam.dict())
	await db.commit()
	return exam


async def delete_exam_service(exam_id: int, db: AsyncSession) -> Exam:
	exam = await db.execute(select(Exam).where(Exam.id == exam_id))
	await db.delete(exam)
	await db.commit()
	return exam


# async def submit_exam_service(exam_id:int, )
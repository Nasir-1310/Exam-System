# Backend/app/services/exam_service.py
from app.models import Exam
from app.models.question import Question
from app.schemas import (
    ExamCreateRequest,
    ExamUpdateRequest,
    QuestionCreateRequest,
    MCQBulkRequest
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status, UploadFile, File
from typing import List, Annotated
from app.utils.docx_utils import process_docx


async def get_all_exams_service(db: AsyncSession) -> List[Exam]:
    """Get all exams with questions"""
    result = await db.execute(
        select(Exam).options(selectinload(Exam.questions))
    )
    return result.scalars().all()


async def add_question_to_exam_service(
    db: AsyncSession,
    exam_id: int,
    question: QuestionCreateRequest
):
    """Add a single question to exam"""
    # Verify exam exists
    exam_result = await db.execute(select(Exam).where(Exam.id == exam_id))
    exam = exam_result.scalar_one_or_none()
    
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    # Create question
    question_obj = Question(
        exam_id=exam_id,
        q_type=question.q_type,
        content=question.content,
        options=question.options,
        answer_idx=question.answer_idx
    )
    
    db.add(question_obj)
    await db.commit()
    await db.refresh(question_obj)
    return question_obj


async def add_mcq_bulk_to_exam_service(
    db: AsyncSession, 
    exam_id: int, 
    question_request: MCQBulkRequest
):
    """Add multiple questions to exam"""
    # Get exam first
    result = await db.execute(select(Exam).where(Exam.id == exam_id))
    exam = result.scalar_one_or_none()
    
    if exam is None:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    # Add all questions from the list
    for question_data in question_request.questions:
        question_obj = Question(
            exam_id=exam_id,
            q_type=question_data.q_type,
            content=question_data.content,
            image=question_data.image,
            option_a=question_data.option_a,
            option_a_img=question_data.option_a_img,
            option_b=question_data.option_b,
            option_b_img=question_data.option_b_img,
            option_c=question_data.option_c,
            option_c_img=question_data.option_c_img,
            option_d=question_data.option_d,
            option_d_img=question_data.option_d_img,
            answer=question_data.answer
        )
        db.add(question_obj)
    
    await db.commit()
    await db.refresh(exam)
    return exam


async def upload_mcq_docx_to_exam_service(
    db: AsyncSession,
    exam_id: int,
    file: Annotated[UploadFile, File(...)]
):
    """Upload MCQ questions from docx file"""
    # Save to temp file
    temp_file_path = f"temp_{exam_id}.docx"
    with open(temp_file_path, "wb") as f:
        f.write(file.file.read())

    return temp_file_path
    


async def create_exam_service(exam: ExamCreateRequest, db: AsyncSession) -> Exam:
    """Create exam with questions"""
    try:
        # Create exam without questions
        exam_data = exam.model_dump(exclude={'questions'})
        exam_obj = Exam(**exam_data)
        db.add(exam_obj)
        await db.flush()
        
        # Add questions
        for question in exam.questions:
            question_obj = Question(
                exam_id=exam_obj.id,
                q_type=question.q_type,
                content=question.content,
                options=question.options,
                answer_idx=question.answer_idx
            )
            db.add(question_obj)
        
        await db.commit()
        await db.refresh(exam_obj)
        return exam_obj
        
    except Exception as e:
        await db.rollback()
        print(f"Error creating exam: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create exam: {str(e)}"
        )


async def get_exam_service(exam_id: int, db: AsyncSession) -> Exam:
    """Get exam by ID with questions"""
    result = await db.execute(
        select(Exam)
        .options(selectinload(Exam.questions))
        .where(Exam.id == exam_id)
    )
    exam = result.scalar_one_or_none()
    
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    return exam


async def update_exam_service(
    exam_id: int, 
    exam_update: ExamUpdateRequest, 
    db: AsyncSession
) -> Exam:
    """Update exam details"""
    result = await db.execute(select(Exam).where(Exam.id == exam_id))
    exam = result.scalar_one_or_none()
    
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    update_data = exam_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(exam, field, value)
    
    await db.commit()
    await db.refresh(exam)
    return exam


async def delete_exam_service(exam_id: int, db: AsyncSession) -> bool:
    """Delete exam"""
    result = await db.execute(select(Exam).where(Exam.id == exam_id))
    exam = result.scalar_one_or_none()
    
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    db.delete(exam)
    await db.commit()
    return True


# ============= NEW FUNCTIONS ADDED BELOW =============

# ADDED: Delete a specific question from an exam
async def delete_question_service(db: AsyncSession, exam_id: int, question_id: int):
    """Delete a specific question from an exam"""
    # Check if exam exists
    exam_result = await db.execute(select(Exam).where(Exam.id == exam_id))
    exam = exam_result.scalar_one_or_none()
    
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exam with id {exam_id} not found"
        )
    
    # Check if question exists and belongs to this exam
    question_result = await db.execute(
        select(Question).where(
            Question.id == question_id,
            Question.exam_id == exam_id
        )
    )
    question = question_result.scalar_one_or_none()
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question with id {question_id} not found in exam {exam_id}"
        )
    
    # Delete the question
    await db.delete(question)
    await db.commit()
    
    return {
        "message": "Question deleted successfully",
        "question_id": question_id,
        "exam_id": exam_id
    }


# ADDED: Update a specific question
async def update_question_service(
    db: AsyncSession, 
    exam_id: int, 
    question_id: int, 
    question_data: QuestionCreateRequest
):
    """Update a specific question"""
    # Check if exam exists
    exam_result = await db.execute(select(Exam).where(Exam.id == exam_id))
    exam = exam_result.scalar_one_or_none()
    
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exam with id {exam_id} not found"
        )
    
    # Check if question exists and belongs to this exam
    question_result = await db.execute(
        select(Question).where(
            Question.id == question_id,
            Question.exam_id == exam_id
        )
    )
    question = question_result.scalar_one_or_none()
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question with id {question_id} not found in exam {exam_id}"
        )
    
    # Update question fields
    question.q_type = question_data.q_type
    question.content = question_data.content
    question.options = question_data.options
    question.answer_idx = question_data.answer_idx
    
    await db.commit()
    await db.refresh(question)
    
    return {
        "message": "Question updated successfully",
        "question_id": question.id,
        "exam_id": exam_id
    }
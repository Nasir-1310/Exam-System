# Backend/app/services/exam_service.py
from app.models import Exam, Question, Result, Answer
from app.schemas import (
    ExamCreateRequest,
    ExamUpdateRequest,
    QuestionCreateRequest,
    MCQBulkRequest,
    ResultDetailedResponse,
    ExamSubmitRequest
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status, UploadFile, File
from typing import List, Annotated
from app.utils.docx_to_questions import docx_to_questions

from datetime import datetime
import os
import tempfile


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
        option_a=question.option_a,
        option_b=question.option_b,
        option_c=question.option_c,
        option_d=question.option_d,
        option_a_img=question.option_a_img,
        option_b_img=question.option_b_img,
        option_c_img=question.option_c_img,
        option_d_img=question.option_d_img,
        answer=question.answer,
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
    
    # Verify exam exists
    result = await db.execute(select(Exam).where(Exam.id == exam_id))
    exam = result.scalar_one_or_none()
    
    if exam is None:
        raise HTTPException(status_code=404, detail="Exam not found")

    # Use NamedTemporaryFile to handle the file safely
    with tempfile.NamedTemporaryFile(suffix=".docx", delete=False) as tmp:
        content = await file.read()
        tmp.write(content)
        temp_file_path = tmp.name

    try:
        # Convert docx to questions
        questions = docx_to_questions(temp_file_path)
        
        questions_added = []
        # Add questions to exam
        for question in questions:
            question_obj = Question(
                exam_id=exam_id,
                q_type=question.q_type,
                content=question.content,
                image=question.image,
                option_a=question.option_a,
                option_a_img=question.option_a_img,
                option_b=question.option_b,
                option_b_img=question.option_b_img,
                option_c=question.option_c,
                option_c_img=question.option_c_img,
                option_d=question.option_d,
                option_d_img=question.option_d_img,
                answer=question.answer
            )
            db.add(question_obj)
            questions_added.append(question_obj)
        
        await db.commit()
        await db.refresh(exam)
        return questions_added
    finally:
        # Clean up temp file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

    


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


async def submit_exam_service(submission: ExamSubmitRequest, db: AsyncSession, user_id: int) -> Result:
    """Submit exam answers"""
    # 1. Verify exam exists
    exam_result = await db.execute(select(Exam).where(Exam.id == submission.exam_id))
    exam = exam_result.scalar_one_or_none()
    
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exam with id {submission.exam_id} not found"
        )
    
    # 2. Process answers and calculate score
    score = 0
    correct_count = 0
    incorrect_count = 0
    answers_to_save = []
    
    for ans_data in submission.answers:
        # Get question
        q_result = await db.execute(
            select(Question).where(
                Question.id == ans_data.question_id,
                Question.exam_id == submission.exam_id
            )
        )
        question = q_result.scalar_one_or_none()
        
        if not question:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Question with id {ans_data.question_id} not found in exam {submission.exam_id}"
            )
        
        is_correct = (question.answer == ans_data.answer)
        if is_correct:
            score += 1
            correct_count += 1
        else:
            score -= float(exam.minus_mark)
            incorrect_count += 1
            
        # Create Answer object
        answer_map = {'A': 0, 'B': 1, 'C': 2, 'D': 3}
        ans_idx = answer_map.get(ans_data.answer.upper(), 0)
        
        answer_obj = Answer(
            question_id=question.id,
            exam_id=submission.exam_id,
            answer=ans_idx,
            is_correct=is_correct,
            mark=1.0 if is_correct else -float(exam.minus_mark)
        )
        answers_to_save.append(answer_obj)
    
    # 3. Create Result
    result = Result(
        exam_id=submission.exam_id,
        user_id=user_id,
        mark=max(0.0, float(score)),
        correct_answers=correct_count,
        incorrect_answers=incorrect_count,
        publish_time=datetime.now()
    )
    db.add(result)
    await db.flush() # Get result.id
    
    # 4. Link answers to result and save
    for answer_obj in answers_to_save:
        answer_obj.result_id = result.id
        db.add(answer_obj)
        
    await db.commit()
    
    # 5. Reload results with answers eagerly to avoid lazy-loading error in Pydantic
    final_result = await db.execute(
        select(Result)
        .options(selectinload(Result.answers).selectinload(Answer.question))
        .where(Result.id == result.id)
    )
    return final_result.scalar_one()
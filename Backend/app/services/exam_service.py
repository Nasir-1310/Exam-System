from app.models import Exam, Course, UserCourseRelation, Result, Answer
from app.models.question import Question
from app.utils.google_drive import validate_and_convert_image_url, convert_google_drive_url
from app.schemas.exam import (
    ExamCreateRequest, 
    ExamUpdateRequest, 
    QuestionCreateRequest,
    MCQBulkRequest
)
from app.schemas.result import ResultCreate, ResultDetailedResponse # Corrected import path
from app.schemas.question import QuestionResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, case
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from typing import List, Optional
from datetime import datetime


async def get_all_exams_service(db: AsyncSession, user_id: Optional[int], course_id: Optional[int] = None) -> List[Exam]:
    """Get all exams with questions filtered by user enrollment and optional course_id (for non-admins)"""
    query = select(Exam).options(selectinload(Exam.questions))
    priority_order = case((Exam.exam_type == "LIVE", 0), else_=1)
    print(f"[DEBUG] get_all_exams_service - Initial query: {query}")
    
    if user_id is not None:
        # For regular users, filter by enrollment and active status
        query = query.outerjoin(Course, Exam.course_id == Course.id).outerjoin(UserCourseRelation, UserCourseRelation.c.Course_id == Course.id)
        query = query.where(UserCourseRelation.c.User_id == user_id)
        
        if course_id:
            query = query.where(Exam.course_id == course_id)
        
        query = query.where(Exam.is_active == True)
        query = query.order_by(priority_order, Exam.id.desc())
        print(f"[DEBUG] get_all_exams_service - Query for user {user_id}: {query}")
    else:
        # For admins, no user-specific filters, retrieve all exams
        # No joins on Course/UserCourseRelation needed here for admin view
        query = query.order_by(priority_order, Exam.id.desc())
        print(f"[DEBUG] get_all_exams_service - Query for admin (all exams): {query}")

    result = await db.execute(query)
    exams = result.scalars().unique().all()
    print(f"[DEBUG] get_all_exams_service - Fetched {len(exams)} exams.")
    return exams


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


async def add_question_to_exam_service(
    db: AsyncSession,
    exam_id: int,
    question: QuestionCreateRequest
):
    """Add a single question to exam with Google Drive URL conversion"""
    # Verify exam exists
    exam_result = await db.execute(select(Exam).where(Exam.id == exam_id))
    exam = exam_result.scalar_one_or_none()
    
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    # Process and validate all URLs
    # Question image
    image_url = validate_and_convert_image_url(question.image_url, 'image_url')
    
    # Option texts (remove any URLs)
    option_a = validate_and_convert_image_url(question.option_a, 'option_a')
    option_b = validate_and_convert_image_url(question.option_b, 'option_b')
    option_c = validate_and_convert_image_url(question.option_c, 'option_c')
    option_d = validate_and_convert_image_url(question.option_d, 'option_d')
    
    # Option images (convert Google Drive URLs)
    option_a_image_url = validate_and_convert_image_url(question.option_a_image_url, 'option_a_image_url')
    option_b_image_url = validate_and_convert_image_url(question.option_b_image_url, 'option_b_image_url')
    option_c_image_url = validate_and_convert_image_url(question.option_c_image_url, 'option_c_image_url')
    option_d_image_url = validate_and_convert_image_url(question.option_d_image_url, 'option_d_image_url')
    
    # Create question with processed URLs
    question_obj = Question(
        exam_id=exam_id,
        q_type=question.q_type,
        content=question.content,
        image_url=image_url,
        description=question.description,
        options=question.options,
        option_a=option_a,
        option_b=option_b,
        option_c=option_c,
        option_d=option_d,
        option_a_image_url=option_a_image_url,
        option_b_image_url=option_b_image_url,
        option_c_image_url=option_c_image_url,
        option_d_image_url=option_d_image_url,
        answer_idx=question.answer_idx
    )
    
    db.add(question_obj)
    await db.commit()
    await db.refresh(question_obj)
    return question_obj


async def update_question_service(
    db: AsyncSession, 
    exam_id: int, 
    question_id: int, 
    question_data: QuestionCreateRequest
):
    """Update a specific question with Google Drive URL conversion"""
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
    
    # Process and validate all URLs
    image_url = validate_and_convert_image_url(question_data.image_url, 'image_url')
    
    # Option texts (remove any URLs)
    option_a = validate_and_convert_image_url(question_data.option_a, 'option_a')
    option_b = validate_and_convert_image_url(question_data.option_b, 'option_b')
    option_c = validate_and_convert_image_url(question_data.option_c, 'option_c')
    option_d = validate_and_convert_image_url(question_data.option_d, 'option_d')
    
    # Option images (convert Google Drive URLs)
    option_a_image_url = validate_and_convert_image_url(question_data.option_a_image_url, 'option_a_image_url')
    option_b_image_url = validate_and_convert_image_url(question_data.option_b_image_url, 'option_b_image_url')
    option_c_image_url = validate_and_convert_image_url(question_data.option_c_image_url, 'option_c_image_url')
    option_d_image_url = validate_and_convert_image_url(question_data.option_d_image_url, 'option_d_image_url')
    
    # Update question fields with processed URLs
    question.q_type = question_data.q_type
    question.content = question_data.content
    question.image_url = image_url
    question.description = question_data.description
    question.options = question_data.options
    question.option_a = option_a
    question.option_b = option_b
    question.option_c = option_c
    question.option_d = option_d
    question.option_a_image_url = option_a_image_url
    question.option_b_image_url = option_b_image_url
    question.option_c_image_url = option_c_image_url
    question.option_d_image_url = option_d_image_url
    question.answer_idx = question_data.answer_idx
    
    await db.commit()
    await db.refresh(question)
    
    return {
        "message": "Question updated successfully",
        "question_id": question.id,
        "exam_id": exam_id
    }


async def delete_exam_service(exam_id: int, db: AsyncSession) -> bool:
    """Delete exam"""
    # Defensive import for func in case module-level import is not working consistently
    from sqlalchemy import func

    result = await db.execute(select(Exam).where(Exam.id == exam_id))
    exam = result.scalar_one_or_none()
    
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    # Add debug prints
    print(f"[DEBUG] Attempting to delete exam with ID: {exam_id}")

    # Check for associated questions or results
    questions_count = await db.scalar(select(func.count(Question.id)).where(Question.exam_id == exam_id))
    results_count = await db.scalar(select(func.count(Result.id)).where(Result.exam_id == exam_id))

    if questions_count > 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete exam: it has associated questions.")
    if results_count > 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete exam: it has associated results.")

    await db.delete(exam)
    print(f"[DEBUG] Exam {exam_id} marked for deletion. Committing...")
    await db.commit()
    print(f"[DEBUG] Exam {exam_id} deletion committed.")
    return True


async def submit_exam_service(db: AsyncSession, exam_id: int, user_id: int, answers: List[dict]) -> Result:
    """Submit exam answers, calculate score, and store detailed results."""
    exam = await db.execute(select(Exam).options(selectinload(Exam.questions)).where(Exam.id == exam_id))
    exam = exam.scalars().first()

    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")

    # Check if user is allowed to take this exam (already handled by get_exam_service, but good to re-check)
    user_course_check = await db.execute(
        select(UserCourseRelation).where(
            UserCourseRelation.c.User_id == user_id,
            UserCourseRelation.c.Course_id == exam.course_id
        )
    )
    if user_course_check.scalar_one_or_none() is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User not enrolled in the course for this exam"
        )

    # Check for multiple attempts
    if not exam.allow_multiple_attempts:
        existing_result = await db.execute(select(Result).where(Result.exam_id == exam_id, Result.user_id == user_id))
        if existing_result.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Multiple attempts not allowed for this exam")

    correct_answers_count = 0
    incorrect_answers_count = 0
    total_mark_obtained = 0.0
    detailed_answers = []

    for submitted_answer in answers:
        question_id = submitted_answer.question_id
        selected_option = submitted_answer.selected_option # For MCQ
        submitted_answer_text = submitted_answer.submitted_answer_text # For Written

        question = next((q for q in exam.questions if q.id == question_id), None)
        if not question:
            continue # Skip if question not found in exam

        is_correct = False
        marks_for_question = 0.0

        if question.q_type == "MCQ":
            if selected_option is not None and question.answer_idx is not None and selected_option == question.answer_idx:
                is_correct = True
                marks_for_question = float(exam.mark) / len(exam.questions) # Assuming equal marks per question for now
            else:
                is_correct = False
                marks_for_question = -float(exam.minus_mark)
            correct_option_index = question.answer_idx
        else: # For written/other types, correctness and marks determined by admin later
            is_correct = None # Cannot determine automatically
            marks_for_question = 0.0 # Will be graded later
            correct_option_index = None

        if is_correct is True:
            correct_answers_count += 1
        elif is_correct is False:
            incorrect_answers_count += 1
        
        total_mark_obtained += marks_for_question

        detailed_answers.append(
            Answer(
                question_id=question_id,
                exam_id=exam_id,
                selected_option=selected_option,
                submitted_answer_text=submitted_answer_text,
                is_correct=is_correct,
                correct_option_index=correct_option_index,
                marks_obtained=marks_for_question
            )
        )

    # Determine attempt number
    last_attempt_result = await db.execute(
        select(Result)
        .where(Result.exam_id == exam_id, Result.user_id == user_id)
        .order_by(Result.attempt_number.desc())
        .limit(1)
    )
    last_attempt = last_attempt_result.scalar_one_or_none()
    attempt_number = (last_attempt.attempt_number + 1) if last_attempt else 1

    result_obj = Result(
        exam_id=exam_id,
        user_id=user_id,
        correct_answers=correct_answers_count,
        incorrect_answers=incorrect_answers_count,
        mark=total_mark_obtained,
        attempt_number=attempt_number,
        answers_details=detailed_answers
    )

    db.add(result_obj)
    await db.commit()
    await db.refresh(result_obj)
    return result_obj


async def get_detailed_exam_result_service(db: AsyncSession, exam_id: int, user_id: int) -> ResultDetailedResponse:
    """Get detailed exam results for a user, with answers revealed after a certain time."""
    # Get the latest result for the user for this exam
    result_query = select(Result).options(selectinload(Result.answers_details)).options(selectinload(Result.exam).selectinload(Exam.questions))
    result_query = result_query.where(Result.exam_id == exam_id, Result.user_id == user_id)
    result_query = result_query.order_by(Result.attempt_number.desc())
    latest_result = await db.execute(result_query)
    result_obj = latest_result.scalars().first()

    if not result_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Result not found for this user and exam")

    # Check if detailed results can be shown
    now = datetime.utcnow()
    if result_obj.exam.show_detailed_results_after and now < result_obj.exam.show_detailed_results_after:
        # If not time to show detailed results, hide them
        for answer in result_obj.answers_details:
            answer.is_correct = None
            answer.correct_option_index = None

    return result_obj


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
    
    # Delete associated answers first (to avoid foreign key constraint errors)
    from sqlalchemy import delete
    await db.execute(
        delete(Answer).where(Answer.question_id == question_id)
    )

    # Delete the question
    await db.delete(question)
    await db.commit()
    
    return {
        "message": "Question deleted successfully",
        "question_id": question_id,
        "exam_id": exam_id
    }


async def create_exam_service(exam: ExamCreateRequest, db: AsyncSession) -> Exam:
    """Create exam with questions and Google Drive URL conversion"""
    try:
        from datetime import datetime

        # Parse datetime strings (format: 2026-01-20T10:00:00)
        start_time = datetime.fromisoformat(exam.start_time)
        show_detailed_results_after = None
        if exam.show_detailed_results_after:
            show_detailed_results_after = datetime.fromisoformat(exam.show_detailed_results_after)

        # Create exam without questions
        exam_data = {
            'title': exam.title,
            'description': exam.description,
            'start_time': start_time,
            'duration_minutes': exam.duration_minutes,
            'mark': exam.mark,
            'minus_mark': exam.minus_mark,
            'course_id': exam.course_id,
            'is_active': exam.is_active,
            'allow_multiple_attempts': exam.allow_multiple_attempts,
            'show_detailed_results_after': show_detailed_results_after,
        }
        exam_obj = Exam(**exam_data)
        db.add(exam_obj)
        await db.flush()
        
        # Add questions with URL processing
        for question in exam.questions:
            # Process URLs
            image_url = validate_and_convert_image_url(question.image_url, 'image_url')
            option_a = validate_and_convert_image_url(question.option_a, 'option_a')
            option_b = validate_and_convert_image_url(question.option_b, 'option_b')
            option_c = validate_and_convert_image_url(question.option_c, 'option_c')
            option_d = validate_and_convert_image_url(question.option_d, 'option_d')
            option_a_image_url = validate_and_convert_image_url(question.option_a_image_url, 'option_a_image_url')
            option_b_image_url = validate_and_convert_image_url(question.option_b_image_url, 'option_b_image_url')
            option_c_image_url = validate_and_convert_image_url(question.option_c_image_url, 'option_c_image_url')
            option_d_image_url = validate_and_convert_image_url(question.option_d_image_url, 'option_d_image_url')
            
            question_obj = Question(
                exam_id=exam_obj.id,
                q_type=question.q_type,
                content=question.content,
                image_url=image_url,
                description=question.description,
                options=question.options,
                option_a=option_a,
                option_b=option_b,
                option_c=option_c,
                option_d=option_d,
                option_a_image_url=option_a_image_url,
                option_b_image_url=option_b_image_url,
                option_c_image_url=option_c_image_url,
                option_d_image_url=option_d_image_url,
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


async def get_exam_service(exam_id: int, user_id: Optional[int], db: AsyncSession) -> Exam:
    """Get exam by ID with questions, ensuring user is enrolled in the associated course (if not admin)"""
    # Use outerjoin to include exams even if they don't have an associated course
    query = select(Exam).options(selectinload(Exam.questions))

    # If it's a regular user, try to join with Course to check enrollment. 
    # For admins (user_id is None), we don't need to join with Course for filtering.
    if user_id is not None:
        query = query.outerjoin(Course, Exam.course_id == Course.id)

    query = query.where(Exam.id == exam_id)
    result = await db.execute(query)
    exam = result.scalars().first()

    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    # Only perform enrollment check if user_id is provided (i.e., not an admin/moderator)
    # and if the exam actually has a course_id
    if user_id is not None and exam.course_id is not None:
        # Check if the user is enrolled in the course associated with this exam
        user_course_check = await db.execute(
            select(UserCourseRelation).where(
                UserCourseRelation.c.User_id == user_id,
                UserCourseRelation.c.Course_id == exam.course_id
            )
        )
        if user_course_check.scalar_one_or_none() is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User not enrolled in the course for this exam"
            )

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
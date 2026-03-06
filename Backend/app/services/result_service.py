from app.models.result import Result
from app.models.answer import Answer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from typing import List
from app.models.user import User


async def get_all_results_service(db: AsyncSession, detailed: bool = False, current_user: User = None) -> List[Result]:
    """Get all results, optionally with detailed answers"""
    query = select(Result).options(
        selectinload(Result.user),
        selectinload(Result.exam),
        selectinload(Result.answers_details)
    )
    
    if current_user:
        query = query.where(Result.user_id == current_user.id)
    
    if detailed:
        query = query.options(
            selectinload(Result.answers_details).selectinload(Answer.question)
        )
    
    results = await db.execute(query)
    result_list = results.scalars().all()

    for result_obj in result_list:
        if result_obj.exam and result_obj.exam.is_mcq is False:
            file_answer = next(
                (ans for ans in result_obj.answers_details if ans.uploaded_file),
                None,
            )
            setattr(result_obj, "written_submission_file", file_answer.uploaded_file if file_answer else None)

    return result_list


async def get_result_service(result_id: int, db: AsyncSession, detailed: bool = False) -> Result:
    """Get result for an exam, optionally for a specific user and with detailed answers"""
    query = select(Result).where(Result.id == result_id).options(
        selectinload(Result.user),
        selectinload(Result.exam),
        selectinload(Result.answers_details),
    )
    
    if detailed:
        query = query.options(
            selectinload(Result.answers_details).selectinload(Answer.question)
        )
    
    result = await db.execute(query)
    result_obj = result.scalar_one_or_none()
    
    if not result_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Result not found"
        )
        
    if result_obj.exam and result_obj.exam.is_mcq is False:
        file_answer = next(
            (ans for ans in result_obj.answers_details if ans.uploaded_file),
            None,
        )
        setattr(result_obj, "written_submission_file", file_answer.uploaded_file if file_answer else None)

    return result_obj


async def delete_result_service(result_id: int, db: AsyncSession) -> dict:
    """Delete a result by ID"""
    # First get the result to check if it exists
    result = await get_result_service(result_id, db)
    
    # Delete associated answers first
    await db.execute(
        delete(Answer).where(Answer.result_id == result_id)
    )
    
    # Delete the result
    await db.delete(result)
    await db.commit()
    
    return {"message": "Result deleted successfully"}

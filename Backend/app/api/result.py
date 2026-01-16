from app.services import result_service
from app.schemas import ResultResponse, ResultDetailedResponse
from fastapi import APIRouter, Depends
from app.lib.db import get_db
from app.utils.jwt import get_current_user
from app.models.user import User
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List


router = APIRouter(
	prefix="/api/result",
	tags=["Result"]
)



@router.get("/for-student", response_model=List[ResultResponse])
async def get_results_for_student(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await result_service.get_all_results_service(db, detailed=True, current_user=current_user)



@router.get("/{result_id}", response_model=ResultResponse)
async def get_result(
    result_id: int, 
    db: AsyncSession = Depends(get_db),
    # current_user: User = Depends(get_current_user)
):
	return await result_service.get_result_service(result_id, db)


@router.get("/{result_id}/detailed", response_model=ResultDetailedResponse)
async def get_result_detailed(
    result_id: int, 
    db: AsyncSession = Depends(get_db),
    # current_user: User = Depends(get_current_user)
):
	return await result_service.get_result_service(result_id, db, detailed=True)



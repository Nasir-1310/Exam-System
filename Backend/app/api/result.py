from app.services import result_service
from app.schemas import ResultResponse
from fastapi import APIRouter


router = APIRouter()

@router.get("/{exam_id}", response_model=ResultResponse)
async def get_result(exam_id: int, db: Session = Depends(get_db)):
	return await result_service.get_result_service(exam_id, db)


@router.get("/{exam_id}/detailed", response_model=ResultDetailedResponse)
async def get_result_detailed(exam_id: int, db: Session = Depends(get_db)):
	return await result_service.get_result_service(exam_id, db)



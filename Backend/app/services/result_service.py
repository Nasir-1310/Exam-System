from app.models.result import Result
from app.schemas.result import ResultDetailedResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

async def get_result_service(exam_id: int, db: AsyncSession) -> ResultDetailedResponse:
	"""Get result"""
	result = await db.execute(select(Result).where(Result.exam_id == exam_id))
	result = result.scalar_one_or_none()
	return result
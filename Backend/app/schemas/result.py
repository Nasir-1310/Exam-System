from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from typing import List
from app.schemas import QuestionResponse


class AnswerCreate(BaseModel):
	question_id: int
	answer_idx: int


class AnswerResponse(BaseModel):
	question: QuestionResponse
	answer: int
	is_correct: bool
	
	class Config:
		from_attributes = True


class ResultResponse(BaseModel):
	id: int
	exam_id: int
	user_id: int
	mark: float
	correct_answers: int
	incorrect_answers: int
	created_at: Optional[datetime] = None
	publish_time: Optional[datetime] = None
	
	class Config:
		from_attributes = True


class ResultDetailedResponse(ResultResponse):
    answers: List[AnswerResponse]
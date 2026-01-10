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
	answer_idx: int
	is_correct: bool


class ResultResponse(BaseModel):
	id: int
	exam_id: int
	user_id: int
	mark: float
	created_at: datetime


class ResultDetailedResponse(ResultResponse):
    answers: List[AnswerResponse]
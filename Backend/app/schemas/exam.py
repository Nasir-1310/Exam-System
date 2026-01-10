from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from typing import List


class QuestionCreateRequest(BaseModel):
	q_type: str
	content: str
	options: Optional[List[str]] = None
	answer_idx: Optional[int] = None


class QuestionResponse(BaseModel):
	id: int
	q_type: str
	content: str
	options: Optional[List[str]] = None
	answer_idx: Optional[int] = None


class ExamCreateRequest(BaseModel):
	title: str
	description: Optional[str] = None
	start_time: datetime
	duration_minutes: int
	mark: float
	minus_mark: float
	course_id: int
	questions: List[QuestionCreateRequest]


class ExamResponse(BaseModel):
	id: int
	title: str
	description: Optional[str] = None
	start_time: datetime
	duration_minutes: int
	mark: float
	minus_mark: float
	course_id: int
	questions: List[QuestionResponse]


class ExamUpdateRequest(BaseModel):
	title: str
	description: Optional[str] = None
	start_time: datetime
	duration_minutes: int
	mark: float
	minus_mark: float
	course_id: int

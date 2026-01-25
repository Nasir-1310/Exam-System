from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
from app.schemas.answer import AnswerResponse


class AnswerCreate(BaseModel):
    question_id: int
    selected_option: Optional[int] = None # Renamed from answer_idx
    submitted_answer_text: Optional[str] = None # For written answers


class AnswerResponse(BaseModel):
    id: int
    question_id: int
    exam_id: int
    result_id: Optional[int] = None
    selected_option: Optional[int] = None
    submitted_answer_text: Optional[str] = None
    is_correct: Optional[bool] = None
    correct_option_index: Optional[int] = None
    marks_obtained: float
    
    class Config:
        from_attributes = True


class ResultCreate(BaseModel):
    exam_id: int
    user_id: int
    correct_answers: int
    incorrect_answers: int
    mark: float
    answers_details: List[AnswerCreate] = Field(default_factory=list)


class ResultResponse(BaseModel):
    id: int
    exam_id: int
    user_id: int
    correct_answers: int
    incorrect_answers: int
    mark: float
    submission_time: datetime
    attempt_number: int
    
    class Config:
        from_attributes = True


class ResultDetailedResponse(ResultResponse):
    answers_details: List[AnswerResponse]


class AnonymousExamSubmitRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    active_mobile: Optional[str] = Field(None, max_length=20)
    answers: List[AnswerCreate]

    @field_validator("active_mobile", mode="before")
    def empty_mobile_to_none(cls, v):
        if v is None:
            return None
        if isinstance(v, str) and v.strip() == "":
            return None
        return v
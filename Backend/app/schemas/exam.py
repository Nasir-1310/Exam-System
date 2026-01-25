# Backend/app/schemas/exam.py
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from .question import QuestionCreateRequest


class QuestionResponse(BaseModel):
    id: int
    q_type: str
    content: str
    image_url: Optional[str] = None
    description: Optional[str] = None
    option_a: Optional[str] = None
    option_b: Optional[str] = None
    option_c: Optional[str] = None
    option_d: Optional[str] = None
    option_a_image_url: Optional[str] = None
    option_b_image_url: Optional[str] = None
    option_c_image_url: Optional[str] = None
    option_d_image_url: Optional[str] = None
    answer: Optional[str] = None
    
    class Config:
        from_attributes = True


class ExamCreateRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    start_time: str
    duration_minutes: int = Field(..., gt=0)
    mark: Decimal = Field(..., gt=0)  # Changed to Decimal
    minus_mark: Decimal = Field(default=0, ge=0)  # Changed to Decimal
    is_mcq: Optional[bool] = True  # ADD THIS
    course_id: Optional[int] = None
    exam_type: str = Field(default="REGULAR")
    is_active: bool = Field(default=True)
    allow_multiple_attempts: bool = Field(default=False)
    end_time: Optional[str] = None  # Optional override; otherwise calculated
    show_detailed_results_after: Optional[str] = None
    price: Optional[Decimal] = None  # ADD THIS - for paid exams
    is_free: bool = Field(default=False)  # ADD THIS
    questions: List[QuestionCreateRequest] = Field(default_factory=list)
    
    class Config:
        json_schema_extra = {
            "example": {
                "title": "47th BCS Preliminary Mock Test",
                "description": "Complete mock test",
                "start_time": "2026-01-20T10:00:00Z",
                "end_time": "2026-01-20",
                "duration_minutes": 120,
                "mark": 200,
                "minus_mark": 0.5,
                "course_id": None,
                "price": 500,
                "is_free": False,
                "questions": [
                    {
                        "q_type": "MCQ",
                        "content": "Sample question?",
                        "image": None,
                        "option_a": "A",
                        "option_a_img": None,
                        "option_b": "B",
                        "option_b_img": None,
                        "option_c": "C",
                        "option_c_img": None,
                        "option_d": "D",
                        "option_d_img": None,
                        "answer": "A"
                    }
                ]
            }
        }


class ExamResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    start_time: datetime
    duration_minutes: int
    mark: Decimal  # Changed to Decimal
    minus_mark: Decimal  # Changed to Decimal
    course_id: Optional[int] = None
    is_mcq: Optional[bool] = True  # ADD THIS
    exam_type: str
    is_active: bool
    allow_multiple_attempts: bool
    show_detailed_results_after: Optional[datetime] = None
    price: Optional[Decimal] = None  # ADD THIS
    is_free: bool  # ADD THIS
    questions: List[QuestionResponse] = []
    
    class Config:
        from_attributes = True


class ExamUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    duration_minutes: Optional[int] = Field(None, gt=0)
    mark: Optional[Decimal] = Field(None, gt=0)  # Changed to Decimal
    minus_mark: Optional[Decimal] = Field(None, ge=0)  # Changed to Decimal
    course_id: Optional[int] = None
    exam_type: Optional[str] = None
    is_active: Optional[bool] = None
    allow_multiple_attempts: Optional[bool] = None
    show_detailed_results_after: Optional[datetime] = None
    price: Optional[Decimal] = None  # ADD THIS
    is_free: Optional[bool] = None  # ADD THIS


class MCQBulkRequest(BaseModel):
    questions: List[QuestionCreateRequest]
    
    class Config:
        json_schema_extra = {
            "example": {
                "questions": [
                    {
                        "q_type": "MCQ",
                        "content": "Question 1?",
                        "image": "img url or None",
                        "option_a": "A",
                        "option_b": "B",
                        "option_c": "C",
                        "option_d": "D",
                        "option_a_img": "img url or None",
                        "option_b_img": "img url or None",
                        "option_c_img": "img url or None",
                        "option_d_img": "img url or None",
                        "answer": "A"
                    },
                    {
                        "q_type": "MCQ",
                        "content": "Question 2?",
                        "image": "img url or None",
                        "option_a": "A",
                        "option_b": "B",
                        "option_c": "C",
                        "option_d": "D",
                        "option_a_img": "img url or None",
                        "option_b_img": "img url or None",
                        "option_c_img": "img url or None",
                        "option_d_img": "img url or None",
                        "answer": "A"
                    }
                ]
            }
        }


class SubmitAnswerRequest(BaseModel):
    question_id: int
    answer: str

class ExamSubmitRequest(BaseModel):
    exam_id: int
    answers: List[SubmitAnswerRequest]

    class Config:
        json_schema_extra = {
            "example": {
                "exam_id": 1,
                "answers": [
                    {
                        "question_id": 1,
                        "answer": "A"
                    },
                    {
                        "question_id": 2,
                        "answer": "B"
                    }
                ]
            }
        }
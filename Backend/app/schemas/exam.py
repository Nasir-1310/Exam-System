# Backend/app/schemas/exam.py
from pydantic import BaseModel, Field
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
    options: Optional[List[str]] = None
    option_a: Optional[str] = None
    option_b: Optional[str] = None
    option_c: Optional[str] = None
    option_d: Optional[str] = None
    option_a_image_url: Optional[str] = None
    option_b_image_url: Optional[str] = None
    option_c_image_url: Optional[str] = None
    option_d_image_url: Optional[str] = None
    answer_idx: Optional[int] = None
    
    class Config:
        from_attributes = True


class ExamCreateRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    start_time: str
    duration_minutes: int = Field(..., gt=0)
    mark: Decimal = Field(..., gt=0)  # Changed to Decimal
    minus_mark: Decimal = Field(default=0, ge=0)  # Changed to Decimal
    course_id: Optional[int] = None
    is_active: bool = Field(default=True)
    allow_multiple_attempts: bool = Field(default=False)
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
                        "options": ["A", "B", "C", "D"],
                        "answer_idx": 0
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
                        "options": ["A", "B", "C", "D"],
                        "answer_idx": 0
                    },
                    {
                        "q_type": "MCQ",
                        "content": "Question 2?",
                        "options": ["A", "B", "C", "D"],
                        "answer_idx": 1
                    }
                ]
            }
        }
# Backend/app/schemas/exam.py
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


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
    
    class Config:
        from_attributes = True


class ExamCreateRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    start_time: datetime
    duration_minutes: int = Field(..., gt=0)
    mark: float = Field(..., gt=0)
    minus_mark: float = Field(default=0, ge=0)
    course_id: Optional[int] = None  # ← FIXED: Now accepts null
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
                "course_id": None,  # Can be null or an integer
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
    mark: float
    minus_mark: float
    course_id: Optional[int] = None  # ← FIXED: Now accepts null
    questions: List[QuestionResponse] = []
    
    class Config:
        from_attributes = True


class ExamUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    duration_minutes: Optional[int] = Field(None, gt=0)
    mark: Optional[float] = Field(None, gt=0)
    minus_mark: Optional[float] = Field(None, ge=0)
    course_id: Optional[int] = None  # ← FIXED: Now accepts null


class MCQBulkRequest(BaseModel):
    questions: List[QuestionCreateRequest]  # ← FIXED: Changed from str to List
    
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
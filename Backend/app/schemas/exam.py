# Backend/app/schemas/exam.py
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime


class QuestionCreateRequest(BaseModel):
    q_type: str
    content: str

    option_a: Optional[str] = None    
    option_a_img: Optional[str] = None

    option_b: Optional[str] = None
    option_b_img: Optional[str] = None

    option_c: Optional[str] = None
    option_c_img: Optional[str] = None

    option_d: Optional[str] = None
    option_d_img: Optional[str] = None

    answer: Optional[str] = None


class QuestionResponse(BaseModel):
    id: int
    q_type: str

    content: Optional[str] = None
    image: Optional[str] = None

    option_a: Optional[str] = None    
    option_a_img: Optional[str] = None

    option_b: Optional[str] = None
    option_b_img: Optional[str] = None

    option_c: Optional[str] = None
    option_c_img: Optional[str] = None

    option_d: Optional[str] = None
    option_d_img: Optional[str] = None

    answer: Optional[str] = None

    @validator("content", "image", pre=True)
    def check_content_and_image(cls, v):
        if v is None:
            raise ValueError("Content or image must be provided")
        return v
    
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
                        "image": None,
                        "options": ["A", "B", "C", "D"],
                        "option_a_img": None,
                        "option_b_img": None,
                        "option_c_img": None,
                        "option_d_img": None,
                        "answer": "A"
                    },
                    {
                        "q_type": "MCQ",
                        "content": "Question 2?",
                        "image": None,
                        "options": ["A", "B", "C", "D"],
                        "option_a_img": None,
                        "option_b_img": None,
                        "option_c_img": None,
                        "option_d_img": None,
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
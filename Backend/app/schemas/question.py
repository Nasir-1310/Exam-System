# Backend/app/schemas/question.py
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime


class QuestionBase(BaseModel):
    q_type: str = Field(..., description="Question type: MCQ or WRITTEN")
    content: str = Field(..., min_length=1, description="Question content")
    image_url: Optional[str] = Field(None, description="Optional image URL for the question")
    description: Optional[str] = Field(None, description="Optional description/explanation for the answer")


class QuestionCreateRequest(QuestionBase):
    options: Optional[List[str]] = Field(None, description="List of options for MCQ questions")
    option_a: Optional[str] = Field(None, description="Option A text")
    option_b: Optional[str] = Field(None, description="Option B text")
    option_c: Optional[str] = Field(None, description="Option C text")
    option_d: Optional[str] = Field(None, description="Option D text")
    option_a_image_url: Optional[str] = Field(None, description="Optional image URL for option A")
    option_b_image_url: Optional[str] = Field(None, description="Optional image URL for option B")
    option_c_image_url: Optional[str] = Field(None, description="Optional image URL for option C")
    option_d_image_url: Optional[str] = Field(None, description="Optional image URL for option D")
    answer_idx: Optional[int] = Field(None, ge=0, le=3, description="Correct answer index (0-3 for A-D)")

    @validator('q_type')
    def validate_q_type(cls, v):
        if v not in ['MCQ', 'WRITTEN']:
            raise ValueError('q_type must be either MCQ or WRITTEN')
        return v

    @validator('answer_idx', always=True)
    def validate_answer_idx(cls, v, values):
        if values.get('q_type') == 'MCQ' and v is None:
            raise ValueError('answer_idx is required for MCQ questions')
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "q_type": "MCQ",
                "content": "What is the capital of Bangladesh?",
                "image_url": "https://example.com/question-image.jpg",
                "description": "Dhaka is the capital and largest city of Bangladesh.",
                "options": ["Dhaka", "Chittagong", "Khulna", "Rajshahi"],
                "option_a": "Dhaka",
                "option_b": "Chittagong",
                "option_c": "Khulna",
                "option_d": "Rajshahi",
                "option_a_image_url": None,
                "option_b_image_url": None,
                "option_c_image_url": None,
                "option_d_image_url": None,
                "answer_idx": 0
            }
        }


class QuestionResponse(QuestionBase):
    id: int
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
    exam_id: int

    class Config:
        from_attributes = True


class BulkQuestionPreview(BaseModel):
    """Schema for previewing parsed bulk questions before saving"""
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
    parse_errors: Optional[List[str]] = Field(default_factory=list, description="Any parsing errors for this question")


class BulkQuestionUploadRequest(BaseModel):
    markdown_content: str = Field(..., description="Markdown-style content with multiple questions")
    exam_id: int = Field(..., description="Exam ID to associate questions with")


class BulkQuestionUploadResponse(BaseModel):
    total_questions: int
    parsed_questions: List[BulkQuestionPreview]
    errors: List[str] = Field(default_factory=list)
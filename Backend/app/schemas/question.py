# Backend/app/schemas/question.py
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime


class QuestionBase(BaseModel):
    q_type: str = Field(..., description="Question type: MCQ or WRITTEN")
    content: str = Field(..., min_length=1, description="Question content (supports HTML)")
    image_url: Optional[str] = Field(None, description="Optional image URL for the question")
    description: Optional[str] = Field(None, description="Optional description/explanation (supports HTML)")


class QuestionCreateRequest(QuestionBase):
    option_a: Optional[str] = Field(None, description="Option A text (supports HTML)")
    option_b: Optional[str] = Field(None, description="Option B text (supports HTML)")
    option_c: Optional[str] = Field(None, description="Option C text (supports HTML)")
    option_d: Optional[str] = Field(None, description="Option D text (supports HTML)")
    option_a_image_url: Optional[str] = Field(None, description="Optional image URL for option A")
    option_b_image_url: Optional[str] = Field(None, description="Optional image URL for option B")
    option_c_image_url: Optional[str] = Field(None, description="Optional image URL for option C")
    option_d_image_url: Optional[str] = Field(None, description="Optional image URL for option D")
    answer: Optional[str] = Field(None, description="Correct answer letter (A-D)")

    @validator('q_type')
    def validate_q_type(cls, v):
        if v not in ['MCQ', 'WRITTEN']:
            raise ValueError('q_type must be either MCQ or WRITTEN')
        return v

    @validator('answer', always=True)
    def validate_answer(cls, v, values):
        if values.get('q_type') == 'MCQ' and v is None:
            raise ValueError('answer is required for MCQ questions')
        return v
    
    # ADDED: Validator to sanitize HTML (optional security measure)
    @validator('content', 'description', 'option_a', 'option_b', 'option_c', 'option_d')
    def sanitize_html(cls, v):
        """
        Optional: Add HTML sanitization here if needed
        For now, we trust the admin input
        You can add bleach library for sanitization if needed:
        import bleach
        if v:
            allowed_tags = ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 
                          'ul', 'ol', 'li', 'span', 'div']
            allowed_attrs = {'span': ['class', 'style'], 'div': ['class']}
            return bleach.clean(v, tags=allowed_tags, attributes=allowed_attrs, strip=True)
        """
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "q_type": "MCQ",
                "content": "<p>What is <strong>2 + 2</strong>?</p><p class='math-inline'>$x^2 + y^2 = r^2$</p>",
                "image_url": "https://example.com/question-image.jpg",
                "description": "<p>This is a simple <em>arithmetic</em> problem.</p>",
                "option_a": "<p>Three</p>",
                "option_b": "<p><strong>Four</strong></p>",
                "option_c": "5",
                "option_d": "6",
                "option_a_image_url": None,
                "option_b_image_url": None,
                "option_c_image_url": None,
                "option_d_image_url": None,
                "answer": 'A'
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
    answer: Optional[str] = None
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
    answer: Optional[str] = None
    parse_errors: Optional[List[str]] = Field(default_factory=list, description="Any parsing errors for this question")


class BulkQuestionUploadRequest(BaseModel):
    markdown_content: str = Field(..., description="Markdown-style content with multiple questions")
    exam_id: int = Field(..., description="Exam ID to associate questions with")


class BulkQuestionUploadResponse(BaseModel):
    total_questions: int
    parsed_questions: List[BulkQuestionPreview]
    errors: List[str] = Field(default_factory=list)
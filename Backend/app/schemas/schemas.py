from pydantic import BaseModel, EmailStr
from typing import Optional, Any
from datetime import date
from decimal import Decimal


class UserResponse(UserBase):
    id: int
    
    class Config:
        from_attributes = True

# Course Schemas
class CourseBase(BaseModel):
    title: str
    description: Optional[str] = None
    thumbnail: str

class CourseCreate(CourseBase):
    pass

class CourseUpdate(CourseBase):
    title: Optional[str] = None
    thumbnail: Optional[str] = None

class CourseResponse(CourseBase):
    id: int

    class Config:
        from_attributes = True

# Exam Schemas
class ExamBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: date
    duration_minutes: int
    mark: Decimal
    minus_mark: Decimal
    course_id: int

class ExamCreate(ExamBase):
    pass

class ExamUpdate(ExamBase):
    title: Optional[str] = None
    start_time: Optional[date] = None
    duration_minutes: Optional[int] = None
    mark: Optional[Decimal] = None
    minus_mark: Optional[Decimal] = None
    course_id: Optional[int] = None

class ExamResponse(ExamBase):
    id: int

    class Config:
        from_attributes = True

# Question Schemas
class QuestionBase(BaseModel):
    q_type: str
    content: str
    options: Optional[Any] = None
    answer_idx: Optional[int] = None
    exam_id: Optional[int] = None

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(QuestionBase):
    q_type: Optional[str] = None
    content: Optional[str] = None

class QuestionResponse(QuestionBase):
    id: int

    class Config:
        from_attributes = True

# Result Schemas
class ResultBase(BaseModel):
    correct_answers: int
    incorrect_answers: int
    mark: Decimal
    publish_time: date
    exam_id: int
    user_id: int

class ResultCreate(ResultBase):
    pass

class ResultResponse(ResultBase):
    id: int

    class Config:
        from_attributes = True

# Answer Schemas
class AnswerBase(BaseModel):
    question_id: Optional[int] = None
    exam_id: Optional[int] = None
    result_id: Optional[int] = None
    answer: Optional[int] = None
    is_correct: Optional[bool] = None
    mark: Optional[int] = None
    written_answers: Optional[Any] = None

class AnswerCreate(AnswerBase):
    pass

class AnswerResponse(AnswerBase):
    id: int

    class Config:
        from_attributes = True

# UserCourse Schema (Many to Many)
class UserCourseBase(BaseModel):
    course_id: int
    user_id: int

class UserCourseCreate(UserCourseBase):
    pass

class UserCourseResponse(UserCourseBase):
    id: int
    
    class Config:
        from_attributes = True

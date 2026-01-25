# Backend/app/models/__init__.py

# Core tables
from app.models.user_course import user_course as UserCourseRelation
from app.models.user import User
from app.models.course import Course
from app.models.exam import Exam
from app.models.question import Question
from app.models.answer import Answer
from app.models.result import Result

# New tables - ADD these
from app.models.exam_session import ExamSession
from app.models.user_course_access import UserCourseAccess
from app.models.user_exam_access import UserExamAccess
from app.models.result_announcement import ResultAnnouncement
from app.models.exam_schedule import ExamSchedule
from app.models.payment import Payment
from app.models.admission_request import AdmissionRequest

# Enums - import from enums.py  
from app.models.enums import (
    UserRole,
    UserRoleSQL,
    ExamType,
    ExamTypeSQL,
    QuestionType,
    QuestionTypeSQL,
    PaymentStatus,
    PaymentStatusSQL,
    PurchaseType,
    PurchaseTypeSQL,
)

# Export all
__all__ = [
    # Tables
    "User",
    "Course",
    "Exam",
    "Question",
    "Answer",
    "Result",
    "UserCourseRelation",
    "ExamSession",
    "UserCourseAccess",
    "UserExamAccess",
    "ResultAnnouncement",
    "ExamSchedule",
    "Payment",
    
    # Enums (Python - Pydantic schemas er jonno)
    "UserRole",
    "ExamType",
    "QuestionType",
    "PaymentStatus",
    "PurchaseType",
    
    # SQL Enums (Database columns er jonno)
    "UserRoleSQL",
    "ExamTypeSQL",
    "QuestionTypeSQL",
    "PaymentStatusSQL",
    "PurchaseTypeSQL",
]
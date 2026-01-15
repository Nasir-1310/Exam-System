# Backend/app/models/enums.py
import enum
from sqlalchemy import Enum as SQLEnum

# Python Enum for Pydantic validation
class UserRole(str, enum.Enum):
    """User role enum for API schemas"""
    USER = "USER"
    MODERATOR = "MODERATOR"
    ADMIN = "ADMIN"

class ExamType(str, enum.Enum):
    """Exam type enum"""
    COURSE = "COURSE"
    BCS_BATCH = "BCS_BATCH"
    BANK_BATCH = "BANK_BATCH"
    STANDALONE = "STANDALONE"

class QuestionType(str, enum.Enum):
    """Question type enum"""
    MCQ = "MCQ"
    CQ = "CQ"

# SQLAlchemy Enums for Database (must have 'name' parameter)
UserRoleSQL = SQLEnum(
    UserRole,
    name="user_role_enum",
    create_constraint=True,
    validate_strings=True,
    native_enum=True
)

ExamTypeSQL = SQLEnum(
    ExamType,
    name="exam_type_enum",
    create_constraint=True,
    validate_strings=True,
    native_enum=True
)

QuestionTypeSQL = SQLEnum(
    QuestionType,
    name="question_type_enum",
    create_constraint=True,
    validate_strings=True,
    native_enum=True
)
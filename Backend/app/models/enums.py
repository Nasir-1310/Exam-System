# Backend/app/models/enums.py
import enum
from sqlalchemy import Enum as SQLEnum

# ============================================
# USER ROLE - কে কি করতে পারবে তা define করে
# ============================================
class UserRole(str, enum.Enum):
    """User role enum - API schemas er jonno"""
    USER = "USER"              # Normal student - exam dite parbe
    MODERATOR = "MODERATOR"    # Question add/edit korte parbe
    ADMIN = "ADMIN"            # Full control - result announce, user manage

# Database er jonno SQL Enum - PostgreSQL e enum type create korbe
UserRoleSQL = SQLEnum(
    UserRole,
    name="user_role_enum",          # DB te enum type er naam
    create_constraint=True,         # CHECK constraint create korbe
    validate_strings=True,          # Invalid value protect korbe
    native_enum=True                # PostgreSQL native enum use korbe
)

# ============================================
# EXAM TYPE - Exam ki type er
# ============================================
class ExamType(str, enum.Enum):
    """Exam category"""
    COURSE = "COURSE"              # Course er under e exam
    BCS_BATCH = "BCS_BATCH"        # BCS batch exam
    BANK_BATCH = "BANK_BATCH"      # Bank job exam
    STANDALONE = "STANDALONE"      # Independent exam (course nai)

ExamTypeSQL = SQLEnum(
    ExamType,
    name="exam_type_enum",
    create_constraint=True,
    validate_strings=True,
    native_enum=True
)

# ============================================
# QUESTION TYPE - Question er format
# ============================================
class QuestionType(str, enum.Enum):
    """Question format type"""
    MCQ = "MCQ"  # Multiple Choice - options thakbe
    CQ = "CQ"    # Creative Question - written answer

QuestionTypeSQL = SQLEnum(
    QuestionType,
    name="question_type_enum",
    create_constraint=True,
    validate_strings=True,
    native_enum=True
)

# ============================================
# PAYMENT STATUS - Payment er state
# ============================================
class PaymentStatus(str, enum.Enum):
    """Payment transaction status"""
    PENDING = "PENDING"      # Payment initiate hoise, complete hoy nai
    SUCCESS = "SUCCESS"      # Payment successful
    FAILED = "FAILED"        # Payment failed
    REFUNDED = "REFUNDED"    # Money return hoise

PaymentStatusSQL = SQLEnum(
    PaymentStatus,
    name="payment_status_enum",
    create_constraint=True,
    validate_strings=True,
    native_enum=True
)

# ============================================
# PURCHASE TYPE - Ki kinte payment hoise
# ============================================
class PurchaseType(str, enum.Enum):
    """What was purchased"""
    COURSE = "COURSE"  # Full course purchase
    EXAM = "EXAM"      # Single exam purchase

PurchaseTypeSQL = SQLEnum(
    PurchaseType,
    name="purchase_type_enum",
    create_constraint=True,
    validate_strings=True,
    native_enum=True
)
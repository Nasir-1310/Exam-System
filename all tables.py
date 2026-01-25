# app/models/answer.py
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DECIMAL, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from app.lib.db import Base

class Answer(Base):
    __tablename__ = "Answer"
    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("Question.id"))
    exam_id = Column(Integer, ForeignKey("Exam.id"))
    result_id = Column(Integer, ForeignKey("Result.id"))
    selected_option = Column(Integer, nullable=True) # Renamed 'answer' to 'selected_option'
    submitted_answer_text = Column(Text, nullable=True) # For written exams
    is_correct = Column(Boolean, nullable=True)
    correct_option_index = Column(Integer, nullable=True) # To store correct option for MCQs
    marks_obtained = Column(DECIMAL, nullable=False, default=0)
    
    question = relationship("Question", back_populates="answers")
    exam = relationship("Exam", back_populates="answers")
    result = relationship("Result", back_populates="answers_details") # Updated relationship name



# Backend/app/models/course.py
from sqlalchemy import Column, DateTime, Integer, String, Boolean, Date, ForeignKey, DECIMAL, Text
from sqlalchemy.orm import relationship
from app.lib.db import Base
from app.models import UserCourseRelation

class Course(Base):
    __tablename__ = "Course"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(Text, nullable=False)
    description = Column(Text)
    thumbnail = Column(Text, nullable=False)
    price = Column(DECIMAL, nullable=False)
    early_bird_price = Column(DECIMAL, nullable=False)
    early_bird_end_date = Column(Date, nullable=False)
    discount = Column(DECIMAL, nullable=False)
    discount_start_date = Column(Date, nullable=False)
    discount_end_date = Column(Date, nullable=False)
    is_free = Column(Boolean, default=False)
    deleted_at = Column(DateTime, nullable=True)
    is_deleted = Column(Boolean, default=False)
    

    exams = relationship("Exam", back_populates="course")
    users = relationship("User", secondary=UserCourseRelation, back_populates="courses") 


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

# models/exam_schedule.py
from sqlalchemy import Column, Integer, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from app.lib.db import Base
from datetime import datetime

class ExamSchedule(Base):
    __tablename__ = "ExamSchedule"
    
    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("Exam.id"), nullable=False)
    
    # Schedule timing
    publish_at = Column(DateTime, nullable=True)  # auto activate exam
    start_at = Column(DateTime, nullable=False)  # exam start time
    end_at = Column(DateTime, nullable=False)  # exam end time
    auto_remove_at = Column(DateTime, nullable=True)  # auto delete/archive
    
    # Status
    is_published = Column(Boolean, default=False)
    is_expired = Column(Boolean, default=False)
    is_removed = Column(Boolean, default=False)
    
    # Notifications
    send_reminder = Column(Boolean, default=True)
    reminder_sent_at = Column(DateTime, nullable=True)
    
    # Relationships
    exam = relationship("Exam", backref="schedule")


    # models/exam_session.py
from sqlalchemy import Column, Integer, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.lib.db import Base
from datetime import datetime

class ExamSession(Base):
    __tablename__ = "ExamSession"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("User.id"), nullable=False)
    exam_id = Column(Integer, ForeignKey("Exam.id"), nullable=False)
    
    # Timing
    started_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    must_complete_by = Column(DateTime, nullable=False)  # started_at + duration
    completed_at = Column(DateTime, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_submitted = Column(Boolean, default=False)
    is_auto_submitted = Column(Boolean, default=False)
    is_abandoned = Column(Boolean, default=False)  # incomplete session
    
    # Relationships
    user = relationship("User", backref="exam_sessions")
    exam = relationship("Exam", backref="sessions")

    # Backend/app/models/exam.py
from sqlalchemy import Column, Integer, String, Text, Date, DECIMAL, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.lib.db import Base 
from datetime import datetime

class Exam(Base):
    __tablename__ = "Exam"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)   
    start_time = Column(DateTime, nullable=False, default=datetime.utcnow)
    duration_minutes = Column(Integer, nullable=False)
    mark = Column(DECIMAL, nullable=False)
    minus_mark = Column(DECIMAL, nullable=False)
    course_id = Column(Integer, ForeignKey("Course.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    allow_multiple_attempts = Column(Boolean, default=False)
    show_detailed_results_after = Column(DateTime, nullable=True)
    price = Column(DECIMAL, nullable=True)  # null = free
    is_free = Column(Boolean, default=False)
    result_announcement_time = Column(DateTime, nullable=True)
    auto_remove_after_days = Column(Integer, nullable=True, default=30)  # auto remove
    deleted_at = Column(DateTime, nullable=True)  # soft delete
    is_deleted = Column(Boolean, default=False)



    course = relationship("Course", back_populates="exams")
    questions = relationship("Question", back_populates="exam")
    results = relationship("Result", back_populates="exam")
    answers = relationship("Answer", back_populates="exam")


    # Backend/app/models/payment.py
from sqlalchemy import Column, Integer, DateTime, ForeignKey, DECIMAL, String, Boolean, Text
from sqlalchemy.orm import relationship
from app.lib.db import Base
from datetime import datetime
from app.models.enums import PaymentStatusSQL, PurchaseTypeSQL  # Import enums

class Payment(Base):
    __tablename__ = "Payment"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("User.id"), nullable=False)
    
    # Payment details
    amount = Column(DECIMAL, nullable=False)
    currency = Column(String(10), default="BDT")  # BDT = Bangladeshi Taka
    transaction_id = Column(String(255), unique=True, nullable=False)
    payment_method = Column(String(100), nullable=True)  # bkash, nagad, card
    
    # Status - ENUM use korchi (pending/success/failed/refunded)
    status = Column(PaymentStatusSQL, nullable=False, default="PENDING")
    paid_at = Column(DateTime, nullable=True)
    
    # Related purchase - ENUM (course/exam)
    purchase_type = Column(PurchaseTypeSQL, nullable=False)
    course_id = Column(Integer, ForeignKey("Course.id"), nullable=True)
    exam_id = Column(Integer, ForeignKey("Exam.id"), nullable=True)
    
    # Gateway response - Payment gateway theke response store
    gateway_response = Column(Text, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="payments")
    course = relationship("Course", back_populates="payments")
    exam = relationship("Exam", back_populates="payments")


    # Backend/app/models/question.py
from sqlalchemy import Column, Integer, String, Boolean, Date, ForeignKey, DECIMAL, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from app.lib.db import Base

class Question(Base):
    __tablename__ = "Question"
    id = Column(Integer, primary_key=True, index=True)
    q_type = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    image_url = Column(Text)  # Optional image URL for the question (increased to Text for Google Drive URLs)
    description = Column(Text)  # Optional description/explanation for the answer
    options = Column(JSONB)
    option_a = Column(Text)
    option_b = Column(Text)
    option_c = Column(Text)
    option_d = Column(Text)
    option_a_image_url = Column(Text)  # Optional image URL for option A (increased to Text for Google Drive URLs)
    option_b_image_url = Column(Text)  # Optional image URL for option B (increased to Text for Google Drive URLs)
    option_c_image_url = Column(Text)  # Optional image URL for option C (increased to Text for Google Drive URLs)
    option_d_image_url = Column(Text)  # Optional image URL for option D (increased to Text for Google Drive URLs)
    answer_idx = Column(Integer)
    answer = Column(String(1))

    exam_id = Column(Integer, ForeignKey("Exam.id"))
    exam = relationship("Exam", back_populates="questions")
    answers = relationship("Answer", back_populates="question")


# models/result_announcement.py
from sqlalchemy import DECIMAL, Column, Integer, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from app.lib.db import Base
from datetime import datetime

class ResultAnnouncement(Base):
    __tablename__ = "ResultAnnouncement"
    
    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("Exam.id"), nullable=False)
    
    # Announcement details
    announced_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    total_students = Column(Integer, nullable=False)
    highest_marks = Column(DECIMAL, nullable=True)
    average_marks = Column(DECIMAL, nullable=True)
    
    # File export
    result_file_url = Column(Text, nullable=True)  # CSV/Excel download link
    
    # Admin tracking
    announced_by = Column(Integer, ForeignKey("User.id"), nullable=False)
    is_published = Column(Boolean, default=True)
    
    # Relationships
    exam = relationship("Exam", backref="announcements")
    admin = relationship("User", foreign_keys=[announced_by])


    # app/models/result.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, DECIMAL, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from app.lib.db import Base
from datetime import datetime

class Result(Base):
    __tablename__ = "Result"
    id = Column(Integer, primary_key=True, index=True)
    correct_answers = Column(Integer, nullable=False)
    incorrect_answers = Column(Integer, nullable=False)
    mark = Column(DECIMAL, nullable=False)
    submission_time = Column(DateTime, nullable=False, default=datetime.utcnow)
    attempt_number = Column(Integer, nullable=False, default=1)
    exam_id = Column(Integer, ForeignKey("Exam.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("User.id"), nullable=False)
    position = Column(Integer, nullable=True)  # rank
    is_announced = Column(Boolean, default=False)
    announced_at = Column(DateTime, nullable=True)
    course_id = Column(Integer, ForeignKey("Course.id"), nullable=True)
    session_id = Column(Integer, ForeignKey("ExamSession.id"), nullable=True)



    exam = relationship("Exam", back_populates="results")
    user = relationship("User", back_populates="results")
    answers_details = relationship("Answer", back_populates="result", cascade="all, delete-orphan") # Renamed for clarity
    session = relationship("ExamSession", backref="result")
    course = relationship("Course")

    # models/user_course_access.py
from sqlalchemy import Column, Integer, DateTime, ForeignKey, DECIMAL, Boolean, String
from sqlalchemy.orm import relationship
from app.lib.db import Base
from datetime import datetime

class UserCourseAccess(Base):
    __tablename__ = "UserCourseAccess"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("User.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("Course.id"), nullable=False)
    
    # Purchase info
    purchased_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    amount_paid = Column(DECIMAL, nullable=True)  # track actual payment
    transaction_id = Column(String(255), nullable=True)  # payment gateway ID
    
    # Access control
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime, nullable=True)  # lifetime access = null
    revoked_at = Column(DateTime, nullable=True)  # admin can revoke
    
    # Relationships
    user = relationship("User", backref="course_accesses")
    course = relationship("Course", backref="user_accesses")


    # app/models/user_course.py
from sqlalchemy import Column, Integer, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.lib.db import Base

user_course = Table(
    "user_course", 
    Base.metadata,
    Column("User_id", Integer, ForeignKey("User.id"), primary_key=True),
    Column("Course_id", Integer, ForeignKey("Course.id"), primary_key=True)
)


# models/user_exam_access.py
from sqlalchemy import Column, Integer, DateTime, ForeignKey, DECIMAL, Boolean, String
from sqlalchemy.orm import relationship
from app.lib.db import Base
from datetime import datetime

class UserExamAccess(Base):
    __tablename__ = "UserExamAccess"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("User.id"), nullable=False)
    exam_id = Column(Integer, ForeignKey("Exam.id"), nullable=False)
    
    # Purchase info
    purchased_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    amount_paid = Column(DECIMAL, nullable=True)
    transaction_id = Column(String(255), nullable=True)
    
    # Access control
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime, nullable=True)
    revoked_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", backref="exam_accesses")
    exam = relationship("Exam", backref="user_accesses")



    # Backend/app/models/user.py
from sqlalchemy import Column, DateTime, Integer, String, Boolean, Date, ForeignKey, DECIMAL, Text
from sqlalchemy.orm import relationship
from app.lib.db import Base
from app.models import UserCourseRelation
from app.models.enums import UserRole
from sqlalchemy import Enum as SQLEnum

class User(Base):
    __tablename__ = "User"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    
    # Contact
    active_mobile = Column(String(20), nullable=False)
    whatsapp = Column(String(20), nullable=True)
    
    # Personal info
    dob = Column(Date, nullable=True)
    last_login = Column(Date, nullable=True)

    is_active = Column(Boolean, default=True)
    is_banned = Column(Boolean, default=False)
    banned_at = Column(DateTime, nullable=True)
    banned_reason = Column(Text, nullable=True)
    
    # Role - FIXED: Use String type instead of enum for async compatibility
    role = Column(String(50), nullable=False, default="USER")
    
    # Relationships
    results = relationship("Result", back_populates="user")
    courses = relationship("Course", secondary=UserCourseRelation, back_populates="users")
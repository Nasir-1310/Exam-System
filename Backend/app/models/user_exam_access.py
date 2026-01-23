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
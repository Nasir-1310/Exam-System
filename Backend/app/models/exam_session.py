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
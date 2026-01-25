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
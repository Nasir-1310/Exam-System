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
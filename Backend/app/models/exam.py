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

    course = relationship("Course", back_populates="exams")
    questions = relationship("Question", back_populates="exam")
    results = relationship("Result", back_populates="exam")
    answers = relationship("Answer", back_populates="exam")
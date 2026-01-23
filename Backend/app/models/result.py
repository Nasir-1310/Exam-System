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
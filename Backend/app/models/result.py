from sqlalchemy import Column, Integer, String, Boolean, Date, ForeignKey, DECIMAL, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from app.lib.db import Base

class Result(Base):
    __tablename__ = "Result"
    id = Column(Integer, primary_key=True, index=True)
    correct_answers = Column(Integer, nullable=False)
    incorrect_answers = Column(Integer, nullable=False)
    mark = Column(DECIMAL, nullable=False)
    publish_time = Column(Date, nullable=False)
    exam_id = Column(Integer, ForeignKey("Exam.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("User.id"), nullable=False)

    exam = relationship("Exam", back_populates="results")
    user = relationship("User", back_populates="results")
    answers = relationship("Answer", back_populates="result")
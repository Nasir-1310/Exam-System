from sqlalchemy import Column, Integer, String, Boolean, Date, ForeignKey, DECIMAL, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from app.lib.db import Base

class Answer(Base):
    __tablename__ = "Answer"
    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("Question.id"))
    exam_id = Column(Integer, ForeignKey("Exam.id"))
    result_id = Column(Integer, ForeignKey("Result.id"))
    answer = Column(Integer)
    is_correct = Column(Boolean)
    mark = Column(Integer)
    written_answers = Column(JSONB, default=[]) # list of image urls

    question = relationship("Question", back_populates="answers")
    exam = relationship("Exam", back_populates="answers")
    result = relationship("Result", back_populates="answers")

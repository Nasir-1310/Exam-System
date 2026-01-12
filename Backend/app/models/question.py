from sqlalchemy import Column, Integer, String, Boolean, Date, ForeignKey, DECIMAL, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from app.lib.db import Base

class Question(Base):
    __tablename__ = "Question"
    id = Column(Integer, primary_key=True, index=True)
    q_type = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    options = Column(JSONB)
    option_a = Column(Text)
    option_b = Column(Text)
    option_c = Column(Text)
    option_d = Column(Text)
    answer_idx = Column(Integer)
    answer = Column(String(1))

    exam_id = Column(Integer, ForeignKey("Exam.id"))
    exam = relationship("Exam", back_populates="questions")
    answers = relationship("Answer", back_populates="question")

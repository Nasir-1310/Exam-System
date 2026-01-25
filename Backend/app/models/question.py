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
    option_a = Column(Text)
    option_a_img = Column(Text)
    option_b = Column(Text)
    option_b_img = Column(Text)
    option_c = Column(Text)
    option_c_img = Column(Text)
    option_d = Column(Text)
    option_a_image_url = Column(Text)  # Optional image URL for option A (increased to Text for Google Drive URLs)
    option_b_image_url = Column(Text)  # Optional image URL for option B (increased to Text for Google Drive URLs)
    option_c_image_url = Column(Text)  # Optional image URL for option C (increased to Text for Google Drive URLs)
    option_d_image_url = Column(Text)  # Optional image URL for option D (increased to Text for Google Drive URLs)

    answer = Column(String(1))

    exam_id = Column(Integer, ForeignKey("Exam.id"))
    exam = relationship("Exam", back_populates="questions")
    answers = relationship("Answer", back_populates="question")

    def __repr__(self):
        return f"<Question(id={self.id}, q_type={self.q_type}, content={self.content[:10]}...), answer: {self.answer})>"

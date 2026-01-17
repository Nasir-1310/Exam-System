from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DECIMAL, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from app.lib.db import Base

class Answer(Base):
    __tablename__ = "Answer"
    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("Question.id"))
    exam_id = Column(Integer, ForeignKey("Exam.id"))
    result_id = Column(Integer, ForeignKey("Result.id"))
    selected_option = Column(Integer, nullable=True) # Renamed 'answer' to 'selected_option'
    submitted_answer_text = Column(Text, nullable=True) # For written exams
    is_correct = Column(Boolean, nullable=True)
    correct_option_index = Column(Integer, nullable=True) # To store correct option for MCQs
    marks_obtained = Column(DECIMAL, nullable=False, default=0)
    
    question = relationship("Question", back_populates="answers")
    exam = relationship("Exam", back_populates="answers")
    result = relationship("Result", back_populates="answers_details") # Updated relationship name

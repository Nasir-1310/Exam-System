from sqlalchemy import Column, Integer, String, Boolean, Date, ForeignKey, DECIMAL, Text
from sqlalchemy.orm import relationship
from app.lib.db import Base
from app.models import user_course

class Course(Base):
    __tablename__ = "Course"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(Text, nullable=False)
    description = Column(Text)
    thumbnail = Column(Text, nullable=False)

    exams = relationship("Exam", back_populates="course")
    courses = relationship("User", secondary=user_course, back_populates="courses") 

# Backend/app/models/course.py
from sqlalchemy import Column, Integer, String, Boolean, Date, ForeignKey, DECIMAL, Text
from sqlalchemy.orm import relationship
from app.lib.db import Base
from app.models import UserCourseRelation

class Course(Base):
    __tablename__ = "Course"
    id = Column(Integer, primary_key=True, index=True)
    
    title = Column(Text, nullable=False)
    description = Column(Text)
    thumbnail = Column(Text, nullable=False)

    price = Column(DECIMAL, nullable=False)
    early_bird_price = Column(DECIMAL, nullable=False)
    early_bird_end_date = Column(Date, nullable=False)
    
    discount = Column(DECIMAL, nullable=False)
    discount_start_date = Column(Date, nullable=False)
    discount_end_date = Column(Date, nullable=False)
    
    exams = relationship("Exam", back_populates="course")
    users = relationship("User", secondary=UserCourseRelation, back_populates="courses") 
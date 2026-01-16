from sqlalchemy import Column, Integer, String, Boolean, Date, ForeignKey, DECIMAL, Text
from sqlalchemy.orm import relationship
from app.lib.db import Base
from app.models.user import User


class AdmissionRequest(Base):
    __tablename__ = "AdmissionRequest"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("User.id"))
    user = relationship("User", back_populates="admission_requests")

    course_id = Column(Integer, ForeignKey("Course.id"))
    course = relationship("Course", back_populates="admission_requests")
    
    status = Column(String(255), nullable=False)
    
    created_at = Column(Date, nullable=False)
    updated_at = Column(Date, nullable=False)


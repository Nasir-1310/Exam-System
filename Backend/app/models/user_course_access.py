# models/user_course_access.py
from sqlalchemy import Column, Integer, DateTime, ForeignKey, DECIMAL, Boolean, String
from sqlalchemy.orm import relationship
from app.lib.db import Base
from datetime import datetime

class UserCourseAccess(Base):
    __tablename__ = "UserCourseAccess"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("User.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("Course.id"), nullable=False)
    
    # Purchase info
    purchased_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    amount_paid = Column(DECIMAL, nullable=True)  # track actual payment
    transaction_id = Column(String(255), nullable=True)  # payment gateway ID
    
    # Access control
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime, nullable=True)  # lifetime access = null
    revoked_at = Column(DateTime, nullable=True)  # admin can revoke
    
    # Relationships
    user = relationship("User", backref="course_accesses")
    course = relationship("Course", backref="user_accesses")
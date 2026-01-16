# Backend/app/models/user.py
from sqlalchemy import Column, Integer, String, Boolean, Date, ForeignKey, DECIMAL, Text
from sqlalchemy.orm import relationship
from app.lib.db import Base
from app.models import UserCourseRelation
from app.models.enums import UserRole
from sqlalchemy import Enum as SQLEnum

class User(Base):
    __tablename__ = "User"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    
    # Contact
    active_mobile = Column(String(20), nullable=False)
    whatsapp = Column(String(20), nullable=True)
    
    # Personal info
    dob = Column(Date, nullable=True)
    last_login = Column(Date, nullable=True)
    
    # Role - FIXED: Use String type instead of enum for async compatibility
    role = Column(String(50), nullable=False, default="USER")
    
    # Relationships
    results = relationship("Result", back_populates="user")
    courses = relationship("Course", secondary=UserCourseRelation, back_populates="users")
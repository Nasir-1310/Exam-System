from sqlalchemy import Column, Integer, String, Boolean, Date, ForeignKey, DECIMAL, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from app.lib.db import Base
from app.models import user_course

class User(Base):
    __tablename__ = "User"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    dob = Column(Date)
    email = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    last_login = Column(Date)
    is_admin = Column(Boolean, nullable=False, default=False)

    results = relationship("Result", back_populates="user")
    user_courses = relationship("User", secondary=user_course, back_populates="users")

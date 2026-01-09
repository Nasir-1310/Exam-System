from sqlalchemy import Column, Integer, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.lib.db import Base

user_course = Table(
    "user_course", 
    Base.metadata,
    Column("User_id", Integer, ForeignKey("User.id"), primary_key=True),
    Column("Course_id", Integer, ForeignKey("Course.id"), primary_key=True)
)
# Backend/app/models/payment.py
from sqlalchemy import Column, Integer, DateTime, ForeignKey, DECIMAL, String, Boolean, Text
from sqlalchemy.orm import relationship
from app.lib.db import Base
from datetime import datetime
from app.models.enums import PaymentStatusSQL, PurchaseTypeSQL  # Import enums

class Payment(Base):
    __tablename__ = "Payment"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("User.id"), nullable=False)
    
    # Payment details
    amount = Column(DECIMAL, nullable=False)
    currency = Column(String(10), default="BDT")  # BDT = Bangladeshi Taka
    transaction_id = Column(String(255), unique=True, nullable=False)
    payment_method = Column(String(100), nullable=True)  # bkash, nagad, card
    
    # Status - ENUM use korchi (pending/success/failed/refunded)
    status = Column(PaymentStatusSQL, nullable=False, default="PENDING")
    paid_at = Column(DateTime, nullable=True)
    
    # Related purchase - ENUM (course/exam)
    purchase_type = Column(PurchaseTypeSQL, nullable=False)
    course_id = Column(Integer, ForeignKey("Course.id"), nullable=True)
    exam_id = Column(Integer, ForeignKey("Exam.id"), nullable=True)
    
    # Gateway response - Payment gateway theke response store
    gateway_response = Column(Text, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="payments")
    course = relationship("Course", back_populates="payments")
    exam = relationship("Exam", back_populates="payments")
from pydantic import BaseModel, EmailStr
from typing import Optional, Any
from datetime import date
from decimal import Decimal

# Course Schemas
class CourseBase(BaseModel):
    title: str
    description: Optional[str] = None
    thumbnail: str
    price: Decimal
    early_bird_price: Decimal
    early_bird_end_date: date
    discount: Decimal
    discount_start_date: date
    discount_end_date: date

class CourseCreate(CourseBase):
    pass

class CourseUpdate(CourseBase):
    title: Optional[str] = None
    thumbnail: Optional[str] = None
    price: Optional[Decimal] = None
    early_bird_price: Optional[Decimal] = None
    early_bird_end_date: Optional[date] = None
    discount: Optional[Decimal] = None
    discount_start_date: Optional[date] = None
    discount_end_date: Optional[date] = None
    
class CourseResponse(CourseBase):
    id: int

    class Config:
        from_attributes = True
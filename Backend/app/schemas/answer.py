from pydantic import BaseModel
from typing import Optional

class AnswerResponse(BaseModel):
    id: int
    question_id: int
    exam_id: int
    result_id: Optional[int] = None
    selected_option: Optional[int] = None
    submitted_answer_text: Optional[str] = None
    is_correct: Optional[bool] = None
    correct_option_index: Optional[int] = None
    marks_obtained: float

    class Config:
        from_attributes = True
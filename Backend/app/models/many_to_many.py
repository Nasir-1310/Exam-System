from sqlalchemy import Column, ForeignKey, Table
from app.db.database import Base

# exam_and_questions = Table(
#     "exam_and_questions_relationship",
#     Base.metadata,
#     Column("exam_id", ForeignKey("exams.id", ondelete="CASCADE"), primary_key=True),
#     Column("question_id", ForeignKey("questions.id", ondelete="CASCADE"), primary_key=True),
# )

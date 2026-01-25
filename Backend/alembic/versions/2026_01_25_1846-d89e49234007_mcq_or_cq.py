"""mcq or cq

Revision ID: d89e49234007
Revises: a1b2c3d4e6f7
Create Date: 2026-01-25 18:46:43.439949

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'd89e49234007'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e6f7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    answer_cols = {col["name"] for col in inspector.get_columns("Answer")}
    exam_cols = {col["name"] for col in inspector.get_columns("Exam")}
    course_cols = {col["name"] for col in inspector.get_columns("Course")}
    question_cols = {col["name"] for col in inspector.get_columns("Question")}
    result_cols = {col["name"] for col in inspector.get_columns("Result")}

    if "selected_option" not in answer_cols:
        op.add_column('Answer', sa.Column('selected_option', sa.Integer(), nullable=True))
    if "submitted_answer_text" not in answer_cols:
        op.add_column('Answer', sa.Column('submitted_answer_text', sa.Text(), nullable=True))
    if "correct_option_index" not in answer_cols:
        op.add_column('Answer', sa.Column('correct_option_index', sa.Integer(), nullable=True))
    if "marks_obtained" not in answer_cols:
        op.add_column('Answer', sa.Column('marks_obtained', sa.DECIMAL(), nullable=False))

    if "answer" in answer_cols:
        op.drop_column('Answer', 'answer')
    if "written_answers" in answer_cols:
        op.drop_column('Answer', 'written_answers')
    if "mark" in answer_cols:
        op.drop_column('Answer', 'mark')

    if "is_free" in course_cols:
        op.alter_column('Course', 'is_free',
                   existing_type=sa.BOOLEAN(),
                   nullable=True,
                   existing_server_default=sa.text('false'))

    if "is_mcq" not in exam_cols:
        op.add_column('Exam', sa.Column('is_mcq', sa.Boolean(), server_default='true', nullable=True))
        op.alter_column('Exam', 'is_mcq', server_default=None)
    if "start_time" in exam_cols:
        op.alter_column('Exam', 'start_time',
                   existing_type=sa.DATE(),
                   type_=sa.DateTime(),
                   existing_nullable=False)
    if "is_active" in exam_cols:
        op.alter_column('Exam', 'is_active',
                   existing_type=sa.BOOLEAN(),
                   nullable=True)
    if "allow_multiple_attempts" in exam_cols:
        op.alter_column('Exam', 'allow_multiple_attempts',
                   existing_type=sa.BOOLEAN(),
                   nullable=True)
    if "is_free" in exam_cols:
        op.alter_column('Exam', 'is_free',
                   existing_type=sa.BOOLEAN(),
                   nullable=True,
                   existing_server_default=sa.text('false'))

    if "image" in question_cols:
        op.drop_column('Question', 'image')
    if "option_d_img" in question_cols:
        op.drop_column('Question', 'option_d_img')

    if "submission_time" not in result_cols:
        op.add_column('Result', sa.Column('submission_time', sa.DateTime(), nullable=False))
    if "attempt_number" not in result_cols:
        op.add_column('Result', sa.Column('attempt_number', sa.Integer(), nullable=False))
    if "publish_time" in result_cols:
        op.drop_column('Result', 'publish_time')


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    answer_cols = {col["name"] for col in inspector.get_columns("Answer")}
    exam_cols = {col["name"] for col in inspector.get_columns("Exam")}
    course_cols = {col["name"] for col in inspector.get_columns("Course")}
    question_cols = {col["name"] for col in inspector.get_columns("Question")}
    result_cols = {col["name"] for col in inspector.get_columns("Result")}

    if "publish_time" not in result_cols:
        op.add_column('Result', sa.Column('publish_time', sa.DATE(), autoincrement=False, nullable=False))
    if "attempt_number" in result_cols:
        op.drop_column('Result', 'attempt_number')
    if "submission_time" in result_cols:
        op.drop_column('Result', 'submission_time')

    if "option_d_img" not in question_cols:
        op.add_column('Question', sa.Column('option_d_img', sa.TEXT(), autoincrement=False, nullable=True))
    if "image" not in question_cols:
        op.add_column('Question', sa.Column('image', sa.TEXT(), autoincrement=False, nullable=True))

    if "is_free" in exam_cols:
        op.alter_column('Exam', 'is_free',
                   existing_type=sa.BOOLEAN(),
                   nullable=False,
                   existing_server_default=sa.text('false'))
    if "allow_multiple_attempts" in exam_cols:
        op.alter_column('Exam', 'allow_multiple_attempts',
                   existing_type=sa.BOOLEAN(),
                   nullable=False)
    if "is_active" in exam_cols:
        op.alter_column('Exam', 'is_active',
                   existing_type=sa.BOOLEAN(),
                   nullable=False)
    if "start_time" in exam_cols:
        op.alter_column('Exam', 'start_time',
                   existing_type=sa.DateTime(),
                   type_=sa.DATE(),
                   existing_nullable=False)
    if "is_mcq" in exam_cols:
        op.drop_column('Exam', 'is_mcq')

    if "is_free" in course_cols:
        op.alter_column('Course', 'is_free',
                   existing_type=sa.BOOLEAN(),
                   nullable=False,
                   existing_server_default=sa.text('false'))

    if "mark" not in answer_cols:
        op.add_column('Answer', sa.Column('mark', sa.NUMERIC(), autoincrement=False, nullable=True))
    if "written_answers" not in answer_cols:
        op.add_column('Answer', sa.Column('written_answers', postgresql.JSONB(astext_type=sa.Text()), autoincrement=False, nullable=True))
    if "answer" not in answer_cols:
        op.add_column('Answer', sa.Column('answer', sa.INTEGER(), autoincrement=False, nullable=True))
    if "marks_obtained" in answer_cols:
        op.drop_column('Answer', 'marks_obtained')
    if "correct_option_index" in answer_cols:
        op.drop_column('Answer', 'correct_option_index')
    if "submitted_answer_text" in answer_cols:
        op.drop_column('Answer', 'submitted_answer_text')
    if "selected_option" in answer_cols:
        op.drop_column('Answer', 'selected_option')

"""Add allow_multiple_attempts column back to Exam table

Revision ID: add_exam_allow_multiple_attempts
Revises: add_exam_is_active_column
Create Date: 2026-01-25 00:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "add_exam_allow_multiple_attempts"
down_revision: Union[str, Sequence[str], None] = "add_exam_is_active_column"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {col["name"] for col in inspector.get_columns("Exam")}

    # Add only if missing; base schema already includes this column
    if "allow_multiple_attempts" not in columns:
        op.add_column(
            "Exam",
            sa.Column(
                "allow_multiple_attempts",
                sa.Boolean(),
                nullable=False,
                server_default=sa.false(),
            ),
        )
        op.alter_column("Exam", "allow_multiple_attempts", server_default=None)


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {col["name"] for col in inspector.get_columns("Exam")}
    if "allow_multiple_attempts" in columns:
        op.drop_column("Exam", "allow_multiple_attempts")

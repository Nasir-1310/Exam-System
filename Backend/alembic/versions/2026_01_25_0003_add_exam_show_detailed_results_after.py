"""Add show_detailed_results_after column back to Exam table

Revision ID: 9f6ae0f3c0b9
Revises: add_exam_allow_multiple_attempts
Create Date: 2026-01-25 00:18:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "9f6ae0f3c0b9"
down_revision: Union[str, Sequence[str], None] = "add_exam_allow_multiple_attempts"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {col["name"] for col in inspector.get_columns("Exam")}

    if "show_detailed_results_after" not in columns:
        op.add_column(
            "Exam",
            sa.Column(
                "show_detailed_results_after",
                sa.DateTime(),
                nullable=True,
            ),
        )


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {col["name"] for col in inspector.get_columns("Exam")}
    if "show_detailed_results_after" in columns:
        op.drop_column("Exam", "show_detailed_results_after")

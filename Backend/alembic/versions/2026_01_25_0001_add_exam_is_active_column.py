"""Add is_active column back to Exam table

Revision ID: add_exam_is_active_column
Revises: 59aa2f508469
Create Date: 2026-01-25 00:01:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "add_exam_is_active_column"
down_revision: Union[str, Sequence[str], None] = "59aa2f508469"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {col["name"] for col in inspector.get_columns("Exam")}

    # Add only if missing to avoid duplicate column errors when base schema already had it
    if "is_active" not in columns:
        op.add_column(
            "Exam",
            sa.Column(
                "is_active",
                sa.Boolean(),
                nullable=False,
                server_default=sa.true(),
            ),
        )
        op.alter_column("Exam", "is_active", server_default=None)


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {col["name"] for col in inspector.get_columns("Exam")}
    if "is_active" in columns:
        op.drop_column("Exam", "is_active")

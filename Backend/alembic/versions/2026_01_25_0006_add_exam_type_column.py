"""Add exam_type column to Exam (REGULAR/LIVE)

Revision ID: a1b2c3d4e6f7
Revises: c9d2b6f5e4a1
Create Date: 2026-01-25 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "a1b2c3d4e6f7"
down_revision: Union[str, Sequence[str], None] = "c9d2b6f5e4a1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "Exam",
        sa.Column("exam_type", sa.String(length=20), nullable=False, server_default="REGULAR"),
    )
    op.alter_column("Exam", "exam_type", server_default=None)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("Exam", "exam_type")

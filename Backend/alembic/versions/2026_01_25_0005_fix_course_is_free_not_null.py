"""Backfill Course.is_free and enforce non-null with default false

Revision ID: c9d2b6f5e4a1
Revises: b7f4c6c7c8d0
Create Date: 2026-01-25 00:38:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "c9d2b6f5e4a1"
down_revision: Union[str, Sequence[str], None] = "b7f4c6c7c8d0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Backfill existing NULLs to False
    op.execute("UPDATE \"Course\" SET is_free = FALSE WHERE is_free IS NULL")
    # Enforce non-null with default False for new rows
    op.alter_column(
        "Course",
        "is_free",
        existing_type=sa.Boolean(),
        nullable=False,
        server_default=sa.false(),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        "Course",
        "is_free",
        existing_type=sa.Boolean(),
        nullable=True,
        server_default=None,
    )

"""add second question image and uploaded file

Revision ID: 2026_03_06_0001
Revises: 0de22bc86e0b
Create Date: 2026-03-06 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2026_03_06_0001'
down_revision: Union[str, Sequence[str], None] = '0de22bc86e0b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('Question', sa.Column('second_image_url', sa.Text(), nullable=True))
    op.add_column('Answer', sa.Column('uploaded_file', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column('Answer', 'uploaded_file')
    op.drop_column('Question', 'second_image_url')

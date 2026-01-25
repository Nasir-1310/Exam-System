"""add is_anonymous to user

Revision ID: 2026_01_25_0000
Revises: 59aa2f508469
Create Date: 2026-01-25 00:00:00
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '2026_01_25_0000'
down_revision = 'd89e49234007'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('User', sa.Column('is_anonymous', sa.Boolean(), server_default='false', nullable=False))


def downgrade():
    op.drop_column('User', 'is_anonymous')

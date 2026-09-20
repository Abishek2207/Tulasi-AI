"""Add preferred_model to user

Revision ID: 5312106ddbfd
Revises: 8d508de83359
Create Date: 2026-09-12 13:56:45.670452

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5312106ddbfd'
down_revision: Union[str, Sequence[str], None] = '8d508de83359'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('user', sa.Column('preferred_model', sa.String(), server_default='gemini', nullable=False))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('user', 'preferred_model')

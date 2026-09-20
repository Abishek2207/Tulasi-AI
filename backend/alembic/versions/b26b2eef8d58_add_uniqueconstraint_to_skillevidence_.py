"""Add UniqueConstraint to SkillEvidence for replay protection

Revision ID: b26b2eef8d58
Revises: ae5e8af27be0
Create Date: 2026-09-14 12:14:19.123456

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'b26b2eef8d58'
down_revision: Union[str, None] = '7f54f9c48d92'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add unique constraint to prevent replay race conditions
    op.create_unique_constraint('uq_skill_evidence_replay', 'skillevidence', ['user_id', 'skill_id', 'source_type', 'source_id'])

def downgrade() -> None:
    # Drop unique constraint
    op.drop_constraint('uq_skill_evidence_replay', 'skillevidence', type_='unique')

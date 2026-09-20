"""Add Skill Gap taxonomy

Revision ID: 6baeeaf581e4
Revises: c3d4e5f6g7h8
Create Date: 2026-09-12 22:55:40.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '6baeeaf581e4'
down_revision: Union[str, None] = 'c3d4e5f6g7h8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('careerrole',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('normalized_name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('description', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_careerrole_name'), 'careerrole', ['name'], unique=True)
    op.create_index(op.f('ix_careerrole_normalized_name'), 'careerrole', ['normalized_name'], unique=True)
    
    op.add_column('skill', sa.Column('normalized_name', sqlmodel.sql.sqltypes.AutoString(), server_default="", nullable=False))
    op.create_index(op.f('ix_skill_normalized_name'), 'skill', ['normalized_name'], unique=False)
    op.add_column('skill', sa.Column('description', sqlmodel.sql.sqltypes.AutoString(), nullable=True))
    op.add_column('skill', sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False))
    
    op.create_table('jobskillrequirement',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('job_id', sa.Integer(), nullable=False),
    sa.Column('skill_id', sa.Integer(), nullable=False),
    sa.Column('importance', sa.Float(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['job_id'], ['job.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['skill_id'], ['skill.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_jobskillrequirement_job_id'), 'jobskillrequirement', ['job_id'], unique=False)
    op.create_index(op.f('ix_jobskillrequirement_skill_id'), 'jobskillrequirement', ['skill_id'], unique=False)
    
    op.create_table('roleskillrequirement',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('role_id', sa.Integer(), nullable=False),
    sa.Column('skill_id', sa.Integer(), nullable=False),
    sa.Column('importance', sa.Float(), nullable=False),
    sa.Column('minimum_level', sa.Float(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['role_id'], ['careerrole.id'], ),
    sa.ForeignKeyConstraint(['skill_id'], ['skill.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_roleskillrequirement_role_id'), 'roleskillrequirement', ['role_id'], unique=False)
    op.create_index(op.f('ix_roleskillrequirement_skill_id'), 'roleskillrequirement', ['skill_id'], unique=False)
    
    op.create_table('userskill',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('skill_id', sa.Integer(), nullable=False),
    sa.Column('proficiency', sa.Float(), nullable=False),
    sa.Column('evidence', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['skill_id'], ['skill.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_userskill_skill_id'), 'userskill', ['skill_id'], unique=False)
    op.create_index(op.f('ix_userskill_user_id'), 'userskill', ['user_id'], unique=False)


def downgrade() -> None:
    pass

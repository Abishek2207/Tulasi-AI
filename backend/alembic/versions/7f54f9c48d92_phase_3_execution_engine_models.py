"""Phase 3 Execution Engine models

Revision ID: 7f54f9c48d92
Revises: 336cacea216b
Create Date: 2026-09-13 16:31:30.198533

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '7f54f9c48d92'
down_revision: Union[str, Sequence[str], None] = '336cacea216b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('careerreadinesslog',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('role_id', sa.Integer(), nullable=False),
    sa.Column('readiness_score', sa.Float(), nullable=False),
    sa.Column('timestamp', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['role_id'], ['careerrole.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_careerreadinesslog_role_id'), 'careerreadinesslog', ['role_id'], unique=False)
    op.create_index(op.f('ix_careerreadinesslog_user_id'), 'careerreadinesslog', ['user_id'], unique=False)
    
    op.create_table('userexperience',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('title', sa.String(), nullable=False),
    sa.Column('experience_type', sa.String(), nullable=False),
    sa.Column('description', sa.String(), nullable=True),
    sa.Column('verified_url', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_userexperience_user_id'), 'userexperience', ['user_id'], unique=False)
    
    op.create_table('userproject',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('title', sa.String(), nullable=False),
    sa.Column('description', sa.String(), nullable=True),
    sa.Column('project_url', sa.String(), nullable=True),
    sa.Column('status', sa.String(), nullable=False),
    sa.Column('completion_date', sa.DateTime(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_userproject_user_id'), 'userproject', ['user_id'], unique=False)
    
    op.create_table('userroadmap',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('role_id', sa.Integer(), nullable=False),
    sa.Column('status', sa.String(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['role_id'], ['careerrole.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_userroadmap_role_id'), 'userroadmap', ['role_id'], unique=False)
    op.create_index(op.f('ix_userroadmap_user_id'), 'userroadmap', ['user_id'], unique=False)
    
    op.create_table('projectskill',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('project_id', sa.Integer(), nullable=False),
    sa.Column('skill_id', sa.Integer(), nullable=False),
    sa.Column('evidence_text', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['project_id'], ['userproject.id'], ),
    sa.ForeignKeyConstraint(['skill_id'], ['skill.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_projectskill_project_id'), 'projectskill', ['project_id'], unique=False)
    op.create_index(op.f('ix_projectskill_skill_id'), 'projectskill', ['skill_id'], unique=False)
    
    op.create_table('roadmapmilestone',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('roadmap_id', sa.Integer(), nullable=False),
    sa.Column('skill_id', sa.Integer(), nullable=True),
    sa.Column('title', sa.String(), nullable=False),
    sa.Column('description', sa.String(), nullable=True),
    sa.Column('order_index', sa.Integer(), nullable=False),
    sa.Column('status', sa.String(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['roadmap_id'], ['userroadmap.id'], ),
    sa.ForeignKeyConstraint(['skill_id'], ['skill.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_roadmapmilestone_roadmap_id'), 'roadmapmilestone', ['roadmap_id'], unique=False)
    op.create_index(op.f('ix_roadmapmilestone_skill_id'), 'roadmapmilestone', ['skill_id'], unique=False)
    
    op.create_table('actiontask',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('milestone_id', sa.Integer(), nullable=True),
    sa.Column('skill_id', sa.Integer(), nullable=True),
    sa.Column('title', sa.String(), nullable=False),
    sa.Column('description', sa.String(), nullable=True),
    sa.Column('difficulty', sa.String(), nullable=False),
    sa.Column('estimated_minutes', sa.Integer(), nullable=False),
    sa.Column('status', sa.String(), nullable=False),
    sa.Column('due_date', sa.DateTime(), nullable=True),
    sa.Column('completed_at', sa.DateTime(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['milestone_id'], ['roadmapmilestone.id'], ),
    sa.ForeignKeyConstraint(['skill_id'], ['skill.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_actiontask_milestone_id'), 'actiontask', ['milestone_id'], unique=False)
    op.create_index(op.f('ix_actiontask_skill_id'), 'actiontask', ['skill_id'], unique=False)
    op.create_index(op.f('ix_actiontask_user_id'), 'actiontask', ['user_id'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_actiontask_user_id'), table_name='actiontask')
    op.drop_index(op.f('ix_actiontask_skill_id'), table_name='actiontask')
    op.drop_index(op.f('ix_actiontask_milestone_id'), table_name='actiontask')
    op.drop_table('actiontask')
    op.drop_index(op.f('ix_roadmapmilestone_skill_id'), table_name='roadmapmilestone')
    op.drop_index(op.f('ix_roadmapmilestone_roadmap_id'), table_name='roadmapmilestone')
    op.drop_table('roadmapmilestone')
    op.drop_index(op.f('ix_projectskill_skill_id'), table_name='projectskill')
    op.drop_index(op.f('ix_projectskill_project_id'), table_name='projectskill')
    op.drop_table('projectskill')
    op.drop_index(op.f('ix_userroadmap_user_id'), table_name='userroadmap')
    op.drop_index(op.f('ix_userroadmap_role_id'), table_name='userroadmap')
    op.drop_table('userroadmap')
    op.drop_index(op.f('ix_userproject_user_id'), table_name='userproject')
    op.drop_table('userproject')
    op.drop_index(op.f('ix_userexperience_user_id'), table_name='userexperience')
    op.drop_table('userexperience')
    op.drop_index(op.f('ix_careerreadinesslog_user_id'), table_name='careerreadinesslog')
    op.drop_index(op.f('ix_careerreadinesslog_role_id'), table_name='careerreadinesslog')
    op.drop_table('careerreadinesslog')

"""phase4_market_intelligence

Revision ID: e6593a3e014e
Revises: b26b2eef8d58
Create Date: 2026-09-14 22:35:00.000000

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel
from app.models.custom_types import VectorType

# revision identifiers, used by Alembic.
revision = 'e6593a3e014e'
down_revision = 'b26b2eef8d58'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column('job', sa.Column('application_url', sqlmodel.sql.sqltypes.AutoString(), nullable=True))
    
    op.create_table('jobembedding',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('job_id', sa.Integer(), nullable=False),
        sa.Column('embedding', VectorType(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['job_id'], ['job.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_jobembedding_job_id'), 'jobembedding', ['job_id'], unique=False)

    op.create_unique_constraint('uq_job_skill', 'jobskillrequirement', ['job_id', 'skill_id'])

    op.create_table('userjobmatch',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('job_id', sa.Integer(), nullable=False),
        sa.Column('semantic_score', sa.Float(), nullable=False),
        sa.Column('skill_gap_score', sa.Float(), nullable=False),
        sa.Column('total_match_score', sa.Float(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['job_id'], ['job.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'job_id', name='uq_user_job_match')
    )
    op.create_index(op.f('ix_userjobmatch_job_id'), 'userjobmatch', ['job_id'], unique=False)
    op.create_index(op.f('ix_userjobmatch_user_id'), 'userjobmatch', ['user_id'], unique=False)

    op.add_column('savedresume', sa.Column('embedding', VectorType(), nullable=True))

def downgrade() -> None:
    pass

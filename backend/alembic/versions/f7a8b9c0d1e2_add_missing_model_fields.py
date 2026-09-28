"""add_missing_model_fields

Revision ID: f7a8b9c0d1e2
Revises: e6593a3e014e
Create Date: 2026-09-28 21:47:00.000000

Adds missing columns:
- user.freeze_used_at (streak freeze timestamp)
- goal.target_companies (roadmap target companies)
- notification: adds nullable extended fields, removes duplicate definitions
"""
from alembic import op
import sqlalchemy as sa


revision = 'f7a8b9c0d1e2'
down_revision = 'e6593a3e014e'
branch_labels = None
depends_on = None


def column_exists(table_name, column_name, conn):
    inspector = sa.inspect(conn)
    cols = [c['name'] for c in inspector.get_columns(table_name)]
    return column_name in cols


def upgrade():
    bind = op.get_bind()

    # 1. user.freeze_used_at
    if not column_exists('user', 'freeze_used_at', bind):
        op.add_column('user', sa.Column('freeze_used_at', sa.DateTime(), nullable=True))

    # 2. goal.target_companies
    if not column_exists('goal', 'target_companies', bind):
        op.add_column('goal', sa.Column('target_companies', sa.String(), nullable=True))

    # 3. notification extended fields (all nullable)
    for col_name in ['role_context', 'summary', 'impact_level', 'source_tech']:
        if not column_exists('notification', col_name, bind):
            op.add_column('notification', sa.Column(col_name, sa.String(), nullable=True))


def downgrade():
    pass

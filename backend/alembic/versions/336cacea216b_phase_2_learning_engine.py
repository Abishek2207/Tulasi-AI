"""Phase 2 Learning Engine

Revision ID: 336cacea216b
Revises: ae5e8af27be0
Create Date: 2026-09-13 11:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel

# revision identifiers, used by Alembic.
revision: str = '336cacea216b'
down_revision: Union[str, Sequence[str], None] = 'ae5e8af27be0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create Tables
    op.create_table('learningtopic',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('skill_id', sa.Integer(), nullable=False),
    sa.Column('name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('description', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('order_index', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['skill_id'], ['skill.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_learningtopic_name'), 'learningtopic', ['name'], unique=False)
    op.create_index(op.f('ix_learningtopic_skill_id'), 'learningtopic', ['skill_id'], unique=False)

    op.create_table('learningresource',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('topic_id', sa.Integer(), nullable=False),
    sa.Column('title', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('description', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('resource_type', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('url', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('difficulty', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('estimated_minutes', sa.Integer(), nullable=False),
    sa.Column('is_available', sa.Boolean(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['topic_id'], ['learningtopic.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_learningresource_topic_id'), 'learningresource', ['topic_id'], unique=False)

    op.create_table('userlearningprogress',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('resource_id', sa.Integer(), nullable=False),
    sa.Column('status', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('started_at', sa.DateTime(), nullable=True),
    sa.Column('completed_at', sa.DateTime(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['resource_id'], ['learningresource.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_userlearningprogress_resource_id'), 'userlearningprogress', ['resource_id'], unique=False)
    op.create_index(op.f('ix_userlearningprogress_user_id'), 'userlearningprogress', ['user_id'], unique=False)

    op.create_table('practicetask',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('skill_id', sa.Integer(), nullable=False),
    sa.Column('topic_id', sa.Integer(), nullable=True),
    sa.Column('title', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('prompt', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('expected_output', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('evaluation_method', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('difficulty', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['skill_id'], ['skill.id'], ),
    sa.ForeignKeyConstraint(['topic_id'], ['learningtopic.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_practicetask_skill_id'), 'practicetask', ['skill_id'], unique=False)
    op.create_index(op.f('ix_practicetask_topic_id'), 'practicetask', ['topic_id'], unique=False)

    op.create_table('practiceattempt',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('task_id', sa.Integer(), nullable=False),
    sa.Column('user_answer', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('score', sa.Float(), nullable=False),
    sa.Column('feedback', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('attempted_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['task_id'], ['practicetask.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_practiceattempt_task_id'), 'practiceattempt', ['task_id'], unique=False)
    op.create_index(op.f('ix_practiceattempt_user_id'), 'practiceattempt', ['user_id'], unique=False)

    op.create_table('assessment',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('skill_id', sa.Integer(), nullable=False),
    sa.Column('title', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('difficulty', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['skill_id'], ['skill.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_assessment_skill_id'), 'assessment', ['skill_id'], unique=False)

    op.create_table('assessmentquestion',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('assessment_id', sa.Integer(), nullable=False),
    sa.Column('prompt', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('options_json', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('expected_answer', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('question_type', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('points', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['assessment_id'], ['assessment.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_assessmentquestion_assessment_id'), 'assessmentquestion', ['assessment_id'], unique=False)

    op.create_table('assessmentattempt',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('assessment_id', sa.Integer(), nullable=False),
    sa.Column('score', sa.Float(), nullable=False),
    sa.Column('passed', sa.Boolean(), nullable=False),
    sa.Column('attempted_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['assessment_id'], ['assessment.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_assessmentattempt_assessment_id'), 'assessmentattempt', ['assessment_id'], unique=False)
    op.create_index(op.f('ix_assessmentattempt_user_id'), 'assessmentattempt', ['user_id'], unique=False)

    op.create_table('skillevidence',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('skill_id', sa.Integer(), nullable=False),
    sa.Column('source_type', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('source_id', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('score', sa.Float(), nullable=False),
    sa.Column('confidence', sa.Float(), nullable=False),
    sa.Column('previous_level', sa.Float(), nullable=False),
    sa.Column('new_level', sa.Float(), nullable=False),
    sa.Column('timestamp', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['skill_id'], ['skill.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_skillevidence_skill_id'), 'skillevidence', ['skill_id'], unique=False)
    op.create_index(op.f('ix_skillevidence_user_id'), 'skillevidence', ['user_id'], unique=False)

    # 2. Add RLS Policies
    op.execute("""
        ALTER TABLE userlearningprogress ENABLE ROW LEVEL SECURITY;
        CREATE POLICY userlearningprogress_isolation_policy ON userlearningprogress 
        FOR ALL USING (user_id::text = current_setting('app.current_user_id', true))
        WITH CHECK (user_id::text = current_setting('app.current_user_id', true));

        ALTER TABLE practiceattempt ENABLE ROW LEVEL SECURITY;
        CREATE POLICY practiceattempt_isolation_policy ON practiceattempt 
        FOR ALL USING (user_id::text = current_setting('app.current_user_id', true))
        WITH CHECK (user_id::text = current_setting('app.current_user_id', true));

        ALTER TABLE assessmentattempt ENABLE ROW LEVEL SECURITY;
        CREATE POLICY assessmentattempt_isolation_policy ON assessmentattempt 
        FOR ALL USING (user_id::text = current_setting('app.current_user_id', true))
        WITH CHECK (user_id::text = current_setting('app.current_user_id', true));

        ALTER TABLE skillevidence ENABLE ROW LEVEL SECURITY;
        CREATE POLICY skillevidence_isolation_policy ON skillevidence 
        FOR ALL USING (user_id::text = current_setting('app.current_user_id', true))
        WITH CHECK (user_id::text = current_setting('app.current_user_id', true));
    """)


def downgrade() -> None:
    # Drop RLS Policies
    op.execute("""
        DROP POLICY IF EXISTS userlearningprogress_isolation_policy ON userlearningprogress;
        ALTER TABLE userlearningprogress DISABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS practiceattempt_isolation_policy ON practiceattempt;
        ALTER TABLE practiceattempt DISABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS assessmentattempt_isolation_policy ON assessmentattempt;
        ALTER TABLE assessmentattempt DISABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS skillevidence_isolation_policy ON skillevidence;
        ALTER TABLE skillevidence DISABLE ROW LEVEL SECURITY;
    """)

    op.drop_index(op.f('ix_skillevidence_user_id'), table_name='skillevidence')
    op.drop_index(op.f('ix_skillevidence_skill_id'), table_name='skillevidence')
    op.drop_table('skillevidence')
    
    op.drop_index(op.f('ix_assessmentattempt_user_id'), table_name='assessmentattempt')
    op.drop_index(op.f('ix_assessmentattempt_assessment_id'), table_name='assessmentattempt')
    op.drop_table('assessmentattempt')
    
    op.drop_index(op.f('ix_assessmentquestion_assessment_id'), table_name='assessmentquestion')
    op.drop_table('assessmentquestion')
    
    op.drop_index(op.f('ix_assessment_skill_id'), table_name='assessment')
    op.drop_table('assessment')
    
    op.drop_index(op.f('ix_practiceattempt_user_id'), table_name='practiceattempt')
    op.drop_index(op.f('ix_practiceattempt_task_id'), table_name='practiceattempt')
    op.drop_table('practiceattempt')
    
    op.drop_index(op.f('ix_practicetask_topic_id'), table_name='practicetask')
    op.drop_index(op.f('ix_practicetask_skill_id'), table_name='practicetask')
    op.drop_table('practicetask')
    
    op.drop_index(op.f('ix_userlearningprogress_user_id'), table_name='userlearningprogress')
    op.drop_index(op.f('ix_userlearningprogress_resource_id'), table_name='userlearningprogress')
    op.drop_table('userlearningprogress')
    
    op.drop_index(op.f('ix_learningresource_topic_id'), table_name='learningresource')
    op.drop_table('learningresource')
    
    op.drop_index(op.f('ix_learningtopic_skill_id'), table_name='learningtopic')
    op.drop_index(op.f('ix_learningtopic_name'), table_name='learningtopic')
    op.drop_table('learningtopic')

"""enable rls

Revision ID: c3d4e5f6g7h8
Revises: b2c3d4e5f6g7
Create Date: 2026-09-12 22:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c3d4e5f6g7h8'
down_revision: Union[str, None] = 'b2c3d4e5f6g7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Tables where user_id dictates strict ownership (must be isolated).
# I am including the ones specifically requested and obvious ones.
STRICT_USER_TABLES = [
    'user',
    'profile',
    'subscription',
    'payment',
    'notification',
    'focussession',
    'document',
    'documentchunk',
    'usermemorychunk',
    'chatmessage',
    'chatsession',
    'savedresume',
    'resumes',
    'persistentinterviewsession',
    'prepplan',
    'dailychallengesubmission',
    'roadmap',
    'userprogress',
    'learning_history',
    'revisionschedule',
    'usersubscription',
    'careerintelligenceprofile',
    'careerintelligenceroadmap',
    'learningplan',
    'dailytask',
    'questionattempt',
    'taskcompletion',
    'learningsession',
    'usagelog'
]

def upgrade() -> None:
    for table in STRICT_USER_TABLES:
        # Enable RLS
        op.execute(f'ALTER TABLE "{table}" ENABLE ROW LEVEL SECURITY')
        
        # Determine the column to use
        col = 'id' if table == 'user' else 'user_id'
        
        # Drop existing policy just in case
        op.execute(f'DROP POLICY IF EXISTS "{table}_isolation_policy" ON "{table}"')
        
        # Create Policy
        # Using current_setting('app.current_user_id', true) to gracefully handle if it's not set
        op.execute(f"""
            CREATE POLICY "{table}_isolation_policy" ON "{table}"
            AS PERMISSIVE
            FOR ALL
            TO authenticated
            USING (
                "{col}"::text = current_setting('app.current_user_id', true)
            )
            WITH CHECK (
                "{col}"::text = current_setting('app.current_user_id', true)
            )
        """)


def downgrade() -> None:
    for table in STRICT_USER_TABLES:
        op.execute(f'DROP POLICY IF EXISTS "{table}_isolation_policy" ON "{table}"')
        op.execute(f'ALTER TABLE "{table}" DISABLE ROW LEVEL SECURITY')

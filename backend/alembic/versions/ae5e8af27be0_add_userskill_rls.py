"""add_userskill_rls

Revision ID: ae5e8af27be0
Revises: 6baeeaf581e4
Create Date: 2026-09-13 10:09:46.054048

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ae5e8af27be0'
down_revision: Union[str, Sequence[str], None] = '6baeeaf581e4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Enable RLS on userskill
    op.execute("ALTER TABLE userskill ENABLE ROW LEVEL SECURITY;")
    
    # Create ALL policy matching the user_id text to app.current_user_id
    op.execute(
        "CREATE POLICY userskill_isolation_policy ON userskill "
        "FOR ALL "
        "USING (user_id::text = current_setting('app.current_user_id', true)) "
        "WITH CHECK (user_id::text = current_setting('app.current_user_id', true));"
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("DROP POLICY IF EXISTS userskill_isolation_policy ON userskill;")
    op.execute("ALTER TABLE userskill DISABLE ROW LEVEL SECURITY;")

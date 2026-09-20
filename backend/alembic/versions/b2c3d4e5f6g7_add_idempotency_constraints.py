"""Add unique constraints for idempotency on provider_payment_id and provider_subscription_id

Revision ID: b2c3d4e5f6g7
Revises: a1b2c3d4e5f6
Create Date: 2026-09-12

Adds:
  - UNIQUE constraint on subscription.provider_subscription_id
  - UNIQUE constraint on payment.provider_payment_id
"""

from alembic import op
import sqlalchemy as sa

revision = 'b2c3d4e5f6g7'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Add unique constraint for provider_subscription_id
    op.create_unique_constraint(
        "uq_subscription_provider_subscription_id", 
        "subscription", 
        ["provider_subscription_id"]
    )
    # Add unique constraint for provider_payment_id
    op.create_unique_constraint(
        "uq_payment_provider_payment_id", 
        "payment", 
        ["provider_payment_id"]
    )

def downgrade() -> None:
    op.drop_constraint("uq_payment_provider_payment_id", "payment", type_="unique")
    op.drop_constraint("uq_subscription_provider_subscription_id", "subscription", type_="unique")

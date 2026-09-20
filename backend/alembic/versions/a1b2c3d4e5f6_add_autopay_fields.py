"""Add subscription AutoPay fields: next_billing_at, provider_payment_method, payment_method

Revision ID: a1b2c3d4e5f6
Revises: 807669dc32cd
Create Date: 2026-09-12

Adds:
  - subscription.next_billing_at  (TIMESTAMP WITH TIME ZONE, nullable)
  - subscription.provider_payment_method  (VARCHAR, nullable — e.g. 'upi', 'card', 'emandate')
  - payment.payment_method  (VARCHAR, nullable — e.g. 'upi', 'card')

Does NOT:
  - Drop any existing columns
  - Modify any RLS policy
  - Alter any existing column type
"""

from alembic import op
import sqlalchemy as sa

revision = 'a1b2c3d4e5f6'
down_revision = '807669dc32cd'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add next_billing_at to subscription
    op.add_column(
        "subscription",
        sa.Column("next_billing_at", sa.DateTime(timezone=True), nullable=True),
    )
    # Add provider_payment_method to subscription
    op.add_column(
        "subscription",
        sa.Column("provider_payment_method", sa.String(), nullable=True),
    )
    # Add payment_method to payment
    op.add_column(
        "payment",
        sa.Column("payment_method", sa.String(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("payment", "payment_method")
    op.drop_column("subscription", "provider_payment_method")
    op.drop_column("subscription", "next_billing_at")

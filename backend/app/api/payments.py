"""
payments.py — Razorpay Subscription-based UPI AutoPay endpoints.

Flow:
  POST /checkout  → Creates Razorpay Subscription; returns subscription_id + public key
  POST /verify    → Verifies subscription payment signature after frontend callback
  POST /webhook   → Handles all Razorpay subscription lifecycle events (source of truth)
  GET  /history   → Returns user's payment history
  POST /cancel    → Cancels the active subscription via Razorpay API

Webhook events handled:
  subscription.activated    → sub becomes active, generate membership_id
  subscription.charged      → renewal payment succeeded, update next_billing_at
  subscription.halted       → payment failed repeatedly, mark past_due
  subscription.pending      → payment pending, mark pending
  subscription.cancelled    → user or system cancelled, mark cancelled
  subscription.completed    → all billing cycles done, mark expired
  payment.failed            → individual payment failed (may retry)
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import json

from app.core.database import get_session
from app.models.models import User, Payment, Subscription
from app.api.deps import get_current_user
from app.core.rate_limit import limiter
from app.core.config import settings
from app.services.payment_service import (
    get_plan_config,
    create_razorpay_subscription,
    verify_subscription_payment_signature,
    verify_webhook_signature,
    cancel_razorpay_subscription,
)
from app.services.membership_service import generate_membership_id

router = APIRouter()

# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _get_or_create_pending_sub(db: Session, user_id: int, plan: str, amount_rupees: float, provider_sub_id: str) -> Subscription:
    """Returns an existing pending subscription for this provider_sub_id, or creates one."""
    existing = db.exec(
        select(Subscription).where(Subscription.provider_subscription_id == provider_sub_id)
    ).first()
    if existing:
        return existing

    sub = Subscription(
        user_id=user_id,
        plan=plan.lower(),
        status="pending",
        amount=amount_rupees,
        currency="INR",
        billing_interval="month",
        payment_provider="razorpay",
        provider_subscription_id=provider_sub_id,
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub


def _deactivate_other_subs(db: Session, user_id: int, keep_sub_id: int) -> None:
    """Deactivates any other active subscriptions for the user (idempotent)."""
    active_others = db.exec(
        select(Subscription).where(
            Subscription.user_id == user_id,
            Subscription.status == "active",
            Subscription.id != keep_sub_id,
        )
    ).all()
    for s in active_others:
        s.status = "cancelled"
        s.updated_at = datetime.now(timezone.utc)
        db.add(s)


def _timestamp_to_dt(ts: int | None) -> datetime | None:
    if ts is None:
        return None
    return datetime.fromtimestamp(ts, tz=timezone.utc)


# ---------------------------------------------------------------------------
# POST /checkout
# ---------------------------------------------------------------------------

class CheckoutRequest(BaseModel):
    plan: str  # 'student' or 'professional'

@router.post("/checkout")
@limiter.limit("5/minute")
def create_checkout(
    request: Request,
    req: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    """
    Creates a Razorpay Subscription for monthly AutoPay.

    Returns subscription_id (sub_xxx) and the public Razorpay key.
    Frontend opens Razorpay Checkout with subscription_id — Razorpay
    automatically presents UPI AutoPay mandate options (Google Pay,
    PhonePe, Paytm, BHIM, Amazon Pay) plus card recurring options.
    """
    try:
        cfg = get_plan_config(req.plan)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    try:
        rzp_sub = create_razorpay_subscription(
            plan=req.plan,
            user_email=current_user.email,
            user_name=getattr(current_user, "name", None),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment gateway error: {str(e)}")

    provider_sub_id: str = rzp_sub["id"]

    # Create a pending DB subscription record (idempotent)
    _get_or_create_pending_sub(
        db=db,
        user_id=current_user.id,
        plan=req.plan,
        amount_rupees=cfg["amount_rupees"],
        provider_sub_id=provider_sub_id,
    )

    return {
        "subscription_id": provider_sub_id,
        "key": settings.RAZORPAY_KEY_ID,
        "plan_name": cfg["name"],
        "amount_rupees": cfg["amount_rupees"],
        "currency": "INR",
        "description": f"TulasiAI {req.plan.capitalize()} — ₹{cfg['amount_rupees']}/month",
    }


# ---------------------------------------------------------------------------
# POST /verify
# ---------------------------------------------------------------------------

class VerifyPaymentRequest(BaseModel):
    razorpay_payment_id: str
    razorpay_subscription_id: str
    razorpay_signature: str

@router.post("/verify")
def verify_payment(
    req: VerifyPaymentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    """
    Verifies the Razorpay subscription payment signature after frontend callback.

    NOTE: This verifies the AUTHENTICATION transaction (mandate setup), not a charge.
    The subscription moves to 'authenticated' state here. It becomes 'active' only
    after the first successful payment is confirmed by webhook (subscription.charged
    or subscription.activated event).

    Idempotent: if already authenticated/active, returns existing membership_id.
    """
    sub = db.exec(
        select(Subscription).where(
            Subscription.provider_subscription_id == req.razorpay_subscription_id
        )
    ).first()

    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")

    if sub.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Idempotency: already authenticated or active
    if sub.status in ("authenticated", "active"):
        return {
            "message": "Subscription already verified",
            "status": sub.status,
            "membership_id": sub.membership_id,
        }

    # Verify signature
    is_valid = verify_subscription_payment_signature(
        razorpay_payment_id=req.razorpay_payment_id,
        razorpay_subscription_id=req.razorpay_subscription_id,
        razorpay_signature=req.razorpay_signature,
    )

    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid payment signature")

    from sqlalchemy.exc import IntegrityError

    try:
        # Record authentication payment if it doesn't exist
        payment = Payment(
            user_id=current_user.id,
            subscription_id=sub.id,
            amount=sub.amount,
            currency="INR",
            provider="razorpay",
            provider_payment_id=req.razorpay_payment_id,
            status="pending",  # Pending until webhook confirms
        )
        db.add(payment)
        
        # Mark subscription as authenticated (awaiting first charge confirmation via webhook)
        sub.status = "authenticated"
        sub.updated_at = datetime.now(timezone.utc)
        db.add(sub)
        
        db.commit()
        db.refresh(sub)
    except IntegrityError:
        # Webhook might have already processed this and inserted the payment
        db.rollback()
        
        # Ensure subscription is at least authenticated if webhook didn't make it active
        if sub.status == "pending":
            sub.status = "authenticated"
            sub.updated_at = datetime.now(timezone.utc)
            db.add(sub)
            db.commit()
            db.refresh(sub)

    return {
        "message": "Subscription mandate authenticated. Awaiting payment confirmation.",
        "status": sub.status,
        "membership_id": sub.membership_id,
    }


# ---------------------------------------------------------------------------
# POST /webhook
# ---------------------------------------------------------------------------

@router.post("/webhook")
async def razorpay_webhook(
    request: Request,
    db: Session = Depends(get_session),
):
    """
    Razorpay webhook handler — source of truth for subscription state.

    Events handled:
      subscription.activated    → first payment done, subscription active
      subscription.charged      → recurring payment succeeded
      subscription.halted       → repeated payment failures, subscription halted
      subscription.pending      → payment pending
      subscription.cancelled    → cancelled by user or system
      subscription.completed    → all billing cycles exhausted
      payment.failed            → individual payment attempt failed
    """
    body_bytes = await request.body()
    signature = request.headers.get("x-razorpay-signature", "")

    if not verify_webhook_signature(body_bytes.decode("utf-8"), signature):
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    try:
        data = json.loads(body_bytes)
    except Exception:
        return {"status": "error", "detail": "Invalid JSON"}

    event: str = data.get("event", "")
    payload = data.get("payload", {})

    try:
        if event == "subscription.activated":
            _handle_subscription_activated(db, payload)

        elif event == "subscription.charged":
            _handle_subscription_charged(db, payload)

        elif event == "subscription.halted":
            _handle_subscription_halted(db, payload)

        elif event == "subscription.pending":
            _handle_subscription_pending(db, payload)

        elif event == "subscription.cancelled":
            _handle_subscription_cancelled(db, payload)

        elif event == "subscription.completed":
            _handle_subscription_completed(db, payload)

        elif event == "payment.failed":
            _handle_payment_failed(db, payload)

        else:
            # Log unknown events but don't fail
            print(f"[Webhook] Unhandled event: {event}")

    except Exception as e:
        print(f"[Webhook] Error handling event {event!r}: {e}")
        return {"status": "error"}

    return {"status": "ok"}


def _get_sub_by_provider_id(db: Session, provider_sub_id: str) -> Subscription | None:
    return db.exec(
        select(Subscription).where(Subscription.provider_subscription_id == provider_sub_id)
    ).first()


def _handle_subscription_activated(db: Session, payload: dict) -> None:
    """subscription.activated — first payment processed, mandate registered."""
    sub_entity = payload.get("subscription", {}).get("entity", {})
    provider_sub_id = sub_entity.get("id")
    if not provider_sub_id:
        return

    sub = _get_sub_by_provider_id(db, provider_sub_id)
    if not sub:
        return

    # Idempotency
    if sub.status == "active":
        return

    now = datetime.now(timezone.utc)
    sub.status = "active"
    sub.started_at = sub.started_at or now
    sub.updated_at = now
    sub.auto_renew = True

    # Set next billing date from Razorpay
    charge_at = sub_entity.get("charge_at")
    current_end = sub_entity.get("current_end")
    sub.next_billing_at = _timestamp_to_dt(charge_at or current_end)
    sub.expires_at = sub.next_billing_at

    # Generate member ID (only if not already assigned)
    if not sub.membership_id:
        sub.membership_id = generate_membership_id(db, sub.plan)

    _deactivate_other_subs(db, sub.user_id, sub.id)
    db.add(sub)
    db.commit()


def _handle_subscription_charged(db: Session, payload: dict) -> None:
    """subscription.charged — recurring payment succeeded."""
    sub_entity = payload.get("subscription", {}).get("entity", {})
    payment_entity = payload.get("payment", {}).get("entity", {})
    provider_sub_id = sub_entity.get("id")
    if not provider_sub_id:
        return

    sub = _get_sub_by_provider_id(db, provider_sub_id)
    if not sub:
        return

    now = datetime.now(timezone.utc)
    sub.status = "active"
    sub.updated_at = now

    charge_at = sub_entity.get("charge_at")
    current_end = sub_entity.get("current_end")
    sub.next_billing_at = _timestamp_to_dt(charge_at or current_end)
    sub.expires_at = sub.next_billing_at

    if not sub.membership_id:
        sub.membership_id = generate_membership_id(db, sub.plan)

    db.add(sub)

    # Record payment (idempotent by provider_payment_id)
    provider_payment_id = payment_entity.get("id")
    if provider_payment_id:
        amount_paise = payment_entity.get("amount", 0)
        payment_method = payment_entity.get("method", None)  # "upi", "card", etc.
        
        from sqlalchemy.exc import IntegrityError
        
        existing_payment = db.exec(
            select(Payment).where(Payment.provider_payment_id == provider_payment_id)
        ).first()
        
        if existing_payment:
            if existing_payment.status != "paid":
                existing_payment.status = "paid"
                existing_payment.paid_at = now
                existing_payment.payment_method = payment_method
                db.add(existing_payment)
                db.commit()
        else:
            p = Payment(
                user_id=sub.user_id,
                subscription_id=sub.id,
                amount=amount_paise / 100,
                currency=payment_entity.get("currency", "INR"),
                provider="razorpay",
                provider_payment_id=provider_payment_id,
                payment_method=payment_method,
                status="paid",
                paid_at=now,
            )
            db.add(p)
            try:
                db.commit()
            except IntegrityError:
                db.rollback()
                # If verify() inserted it concurrently, fetch and update it
                existing_payment = db.exec(
                    select(Payment).where(Payment.provider_payment_id == provider_payment_id)
                ).first()
                if existing_payment and existing_payment.status != "paid":
                    existing_payment.status = "paid"
                    existing_payment.paid_at = now
                    existing_payment.payment_method = payment_method
                    db.add(existing_payment)
                    db.commit()


def _handle_subscription_halted(db: Session, payload: dict) -> None:
    """subscription.halted — Razorpay stopped trying after repeated failures."""
    sub_entity = payload.get("subscription", {}).get("entity", {})
    provider_sub_id = sub_entity.get("id")
    if not provider_sub_id:
        return

    sub = _get_sub_by_provider_id(db, provider_sub_id)
    if sub and sub.status != "cancelled":
        sub.status = "past_due"
        sub.auto_renew = False
        sub.updated_at = datetime.now(timezone.utc)
        db.add(sub)
        db.commit()


def _handle_subscription_pending(db: Session, payload: dict) -> None:
    """subscription.pending — payment in process."""
    sub_entity = payload.get("subscription", {}).get("entity", {})
    provider_sub_id = sub_entity.get("id")
    if not provider_sub_id:
        return

    sub = _get_sub_by_provider_id(db, provider_sub_id)
    if sub and sub.status not in ("active", "cancelled"):
        sub.status = "pending"
        sub.updated_at = datetime.now(timezone.utc)
        db.add(sub)
        db.commit()


def _handle_subscription_cancelled(db: Session, payload: dict) -> None:
    """subscription.cancelled — cancelled by user or system."""
    sub_entity = payload.get("subscription", {}).get("entity", {})
    provider_sub_id = sub_entity.get("id")
    if not provider_sub_id:
        return

    sub = _get_sub_by_provider_id(db, provider_sub_id)
    if sub:
        sub.status = "cancelled"
        sub.auto_renew = False
        sub.updated_at = datetime.now(timezone.utc)
        db.add(sub)
        db.commit()


def _handle_subscription_completed(db: Session, payload: dict) -> None:
    """subscription.completed — all billing cycles exhausted."""
    sub_entity = payload.get("subscription", {}).get("entity", {})
    provider_sub_id = sub_entity.get("id")
    if not provider_sub_id:
        return

    sub = _get_sub_by_provider_id(db, provider_sub_id)
    if sub:
        sub.status = "expired"
        sub.auto_renew = False
        sub.updated_at = datetime.now(timezone.utc)
        db.add(sub)
        db.commit()


def _handle_payment_failed(db: Session, payload: dict) -> None:
    """payment.failed — individual payment attempt failed (subscription may retry)."""
    payment_entity = payload.get("payment", {}).get("entity", {})
    provider_payment_id = payment_entity.get("id")
    sub_id_from_payment = payment_entity.get("subscription_id")

    if not provider_payment_id:
        return

    # Idempotency
    existing = db.exec(
        select(Payment).where(Payment.provider_payment_id == provider_payment_id)
    ).first()
    if existing:
        if existing.status != "failed":
            existing.status = "failed"
            db.add(existing)
            db.commit()
        return

    # Find subscription
    sub = None
    if sub_id_from_payment:
        sub = _get_sub_by_provider_id(db, sub_id_from_payment)

    p = Payment(
        user_id=sub.user_id if sub else 0,
        subscription_id=sub.id if sub else None,
        amount=(payment_entity.get("amount", 0)) / 100,
        currency=payment_entity.get("currency", "INR"),
        provider="razorpay",
        provider_payment_id=provider_payment_id,
        status="failed",
    )
    db.add(p)
    db.commit()


# ---------------------------------------------------------------------------
# GET /history
# ---------------------------------------------------------------------------

@router.get("/history")
def get_payment_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    """Returns the authenticated user's payment history (most recent first)."""
    payments = db.exec(
        select(Payment)
        .where(Payment.user_id == current_user.id)
        .order_by(Payment.created_at.desc())
    ).all()

    return [
        {
            "id": p.id,
            "amount": p.amount,
            "currency": p.currency,
            "status": p.status,
            "payment_method": p.payment_method,
            "provider_payment_id": p.provider_payment_id,
            "paid_at": p.paid_at.isoformat() if p.paid_at else None,
            "created_at": p.created_at.isoformat(),
        }
        for p in payments
    ]


# ---------------------------------------------------------------------------
# POST /cancel
# ---------------------------------------------------------------------------

class CancelRequest(BaseModel):
    cancel_at_cycle_end: bool = True  # True = access until period end; False = immediate

@router.post("/cancel")
@limiter.limit("3/minute")
def cancel_subscription(
    request: Request,
    req: CancelRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    """
    Cancels the user's active subscription via Razorpay API.

    cancel_at_cycle_end=True (default): user retains access until the
    current billing period ends. The subscription.cancelled webhook
    confirms and marks the DB record accordingly.
    """
    sub = db.exec(
        select(Subscription).where(
            Subscription.user_id == current_user.id,
            Subscription.status.in_(["active", "authenticated", "past_due"]),
        )
    ).first()

    if not sub:
        raise HTTPException(status_code=404, detail="No active subscription found")

    if not sub.provider_subscription_id:
        raise HTTPException(status_code=400, detail="No provider subscription ID on record")

    try:
        cancel_razorpay_subscription(sub.provider_subscription_id, req.cancel_at_cycle_end)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cancellation failed: {str(e)}")

    # Optimistic update — webhook will confirm
    sub.auto_renew = False
    sub.updated_at = datetime.now(timezone.utc)
    if not req.cancel_at_cycle_end:
        sub.status = "cancelled"
    db.add(sub)
    db.commit()

    return {
        "message": "Subscription cancelled successfully",
        "cancel_at_cycle_end": req.cancel_at_cycle_end,
        "access_until": sub.expires_at.isoformat() if sub.expires_at and req.cancel_at_cycle_end else None,
    }

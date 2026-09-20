"""
payment_service.py — Razorpay Subscription-based recurring payments.

Architecture:
  - Uses Razorpay Subscriptions API (not Orders) for monthly recurring AutoPay.
  - Flow: Create/Fetch Plan → Create Subscription → Frontend opens checkout with subscription_id
  - Razorpay Checkout with subscription_id presents UPI AutoPay mandate (Google Pay, PhonePe,
    Paytm, BHIM, Amazon Pay) and card recurring options.
  - Signature verification uses verify_subscription_payment_signature (not verify_payment_signature).
  - Webhooks are the source of truth for subscription activation.
"""

import hmac
import hashlib
import razorpay
from typing import Dict, Any
from app.core.config import settings

# ---------------------------------------------------------------------------
# Razorpay client
# ---------------------------------------------------------------------------

def _get_client() -> razorpay.Client:
    if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
        raise Exception("Razorpay API credentials not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.")
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

# ---------------------------------------------------------------------------
# Plan configuration — amounts in paise (INR × 100)
# ---------------------------------------------------------------------------

PLAN_CONFIG: Dict[str, Dict[str, Any]] = {
    "student": {
        "name": "TulasiAI Student Membership",
        "description": "Monthly AI career operating system for students",
        "amount_paise": 50000,   # ₹500
        "amount_rupees": 500,
        "env_plan_id_attr": "RAZORPAY_PLAN_ID_STUDENT",
    },
    "professional": {
        "name": "TulasiAI Professional Membership",
        "description": "Monthly AI career operating system for working professionals",
        "amount_paise": 70000,   # ₹700
        "amount_rupees": 700,
        "env_plan_id_attr": "RAZORPAY_PLAN_ID_PROFESSIONAL",
    },
}

# In-memory cache for plan IDs created during runtime (avoids duplicate API calls)
_plan_id_cache: Dict[str, str] = {}


def get_plan_config(plan: str) -> Dict[str, Any]:
    plan = plan.lower()
    if plan not in PLAN_CONFIG:
        raise ValueError(f"Invalid plan: {plan!r}. Must be 'student' or 'professional'.")
    return PLAN_CONFIG[plan]


def get_amount_for_plan(plan: str) -> int:
    """Returns amount in paise (INR × 100) for the given plan name."""
    return get_plan_config(plan)["amount_paise"]


def get_or_create_razorpay_plan(plan: str) -> str:
    """
    Returns the Razorpay plan_id for the given TulasiAI plan.

    Priority:
      1. RAZORPAY_PLAN_ID_STUDENT / RAZORPAY_PLAN_ID_PROFESSIONAL env var
      2. In-memory cache (created in current process)
      3. Create via Razorpay Plans API and cache result

    Note: Razorpay Plans are reusable. Creating duplicates wastes resources.
    Recommended: Create plans once in Razorpay Dashboard and set env vars.
    """
    plan = plan.lower()
    cfg = get_plan_config(plan)

    # 1. Check env var
    env_id = getattr(settings, cfg["env_plan_id_attr"], None)
    if env_id:
        return env_id

    # 2. Check in-memory cache
    if plan in _plan_id_cache:
        return _plan_id_cache[plan]

    # 3. Create via API
    client = _get_client()
    plan_data = {
        "period": "monthly",
        "interval": 1,
        "item": {
            "name": cfg["name"],
            "amount": cfg["amount_paise"],
            "currency": "INR",
            "description": cfg["description"],
        },
        "notes": {
            "plan_type": plan,
            "product": "tulasiai_membership",
        },
    }
    result = client.plan.create(data=plan_data)
    plan_id = result.get("id")
    if not plan_id:
        raise Exception(f"Razorpay plan creation failed: {result}")

    _plan_id_cache[plan] = plan_id
    return plan_id


def create_razorpay_subscription(
    plan: str,
    user_email: str | None = None,
    user_name: str | None = None,
    user_contact: str | None = None,
    total_count: int = 120,  # 120 months = 10 years (effectively indefinite)
) -> Dict[str, Any]:
    """
    Creates a Razorpay Subscription for monthly recurring AutoPay.

    Returns the full subscription object. The important field is `id` (sub_xxx),
    which the frontend passes to Razorpay Checkout.

    The subscription starts in 'created' state. After the user completes
    authentication (UPI mandate or card tokenization), it moves to 'authenticated'.
    After the first payment, it becomes 'active' — confirmed by webhook.
    """
    client = _get_client()
    plan_id = get_or_create_razorpay_plan(plan)

    subscription_data: Dict[str, Any] = {
        "plan_id": plan_id,
        "total_count": total_count,
        "quantity": 1,
        "customer_notify": True,
        "notes": {
            "plan_type": plan,
            "product": "tulasiai_membership",
        },
    }

    # Add customer prefill if available
    if user_email or user_name or user_contact:
        notify = {}
        if user_email:
            notify["email"] = user_email
        if user_name:
            notify["name"] = user_name
        if user_contact:
            notify["contact"] = user_contact
        subscription_data["notify_info"] = notify

    result = client.subscription.create(data=subscription_data)
    if not result.get("id"):
        raise Exception(f"Razorpay subscription creation failed: {result}")

    return result


def verify_subscription_payment_signature(
    razorpay_payment_id: str,
    razorpay_subscription_id: str,
    razorpay_signature: str,
) -> bool:
    """
    Verifies the payment signature for a subscription checkout.

    IMPORTANT: This is different from verifying an Order payment.
    Subscription verification uses:
      HMAC-SHA256(payment_id + "|" + subscription_id, key_secret)
    """
    if not settings.RAZORPAY_KEY_SECRET:
        return False
    try:
        client = _get_client()
        client.utility.verify_subscription_payment_signature({
            "razorpay_payment_id": razorpay_payment_id,
            "razorpay_subscription_id": razorpay_subscription_id,
            "razorpay_signature": razorpay_signature,
        })
        return True
    except Exception:
        return False


def verify_webhook_signature(body: str, signature: str) -> bool:
    """Verifies a Razorpay webhook HMAC-SHA256 signature."""
    secret = settings.RAZORPAY_WEBHOOK_SECRET
    if not secret:
        return False

    expected_sig = hmac.new(
        bytes(secret, "utf-8"),
        msg=bytes(body, "utf-8"),
        digestmod=hashlib.sha256,
    ).hexdigest()

    return hmac.compare_digest(expected_sig, signature)


def cancel_razorpay_subscription(provider_subscription_id: str, cancel_at_cycle_end: bool = True) -> Dict[str, Any]:
    """
    Cancels a Razorpay subscription.
    cancel_at_cycle_end=True means access continues until the paid period ends.
    cancel_at_cycle_end=False means immediate cancellation.
    """
    client = _get_client()
    return client.subscription.cancel(
        subscription_id=provider_subscription_id,
        data={"cancel_at_cycle_end": 1 if cancel_at_cycle_end else 0},
    )


def fetch_razorpay_subscription(provider_subscription_id: str) -> Dict[str, Any]:
    """Fetches the current state of a Razorpay subscription."""
    client = _get_client()
    return client.subscription.fetch(provider_subscription_id)

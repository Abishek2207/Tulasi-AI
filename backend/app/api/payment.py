"""
Razorpay Payment Integration for Tulasi AI
Endpoints:
  POST /api/payment/create-order  — Create a Razorpay order (authenticated)
  POST /api/payment/verify        — Verify payment signature & upgrade user to Pro
  GET  /api/payment/status        — Get current user Pro status
"""

import os
import hmac
import hashlib
import requests as http_requests
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session

from app.core.database import get_session
from app.core.security import get_current_user
from app.models.models import User

router = APIRouter()

RAZORPAY_KEY_ID     = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")
RAZORPAY_BASE_URL   = "https://api.razorpay.com/v1"


def _razorpay_request(method: str, endpoint: str, **kwargs):
    """Make an authenticated request to Razorpay API using HTTP Basic Auth."""
    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        raise HTTPException(
            status_code=503,
            detail="Razorpay keys not configured. Contact support."
        )
    url = f"{RAZORPAY_BASE_URL}{endpoint}"
    resp = http_requests.request(
        method,
        url,
        auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET),
        timeout=15,
        **kwargs
    )
    if not resp.ok:
        raise HTTPException(
            status_code=500,
            detail=f"Razorpay API error: {resp.text}"
        )
    return resp.json()


# ── Schemas ─────────────────────────────────────────────────────────────────

class CreateOrderResponse(BaseModel):
    order_id: str
    amount: int       # in paise (e.g. 74900 = ₹749)
    currency: str
    key_id: str

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id:   str
    razorpay_payment_id: str
    razorpay_signature:  str

class VerifyPaymentResponse(BaseModel):
    success: bool
    message: str
    is_pro: bool


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/create-order", response_model=CreateOrderResponse)
def create_order(
    user: User = Depends(get_current_user),
    db:   Session = Depends(get_session),
):
    """
    Creates a Razorpay order for the Pro plan (₹749/month).
    Returns order details needed by the Razorpay checkout.js SDK.
    """
    if user.is_pro:
        raise HTTPException(status_code=400, detail="User is already a Pro member.")

    try:
        amount_paise = 74900  # ₹749.00
        order = _razorpay_request("POST", "/orders", json={
            "amount":   amount_paise,
            "currency": "INR",
            "receipt":  f"tulasiai_pro_{user.id}",
            "notes": {
                "user_id": str(user.id),
                "email":   user.email,
                "plan":    "pro_monthly",
            }
        })
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Order creation failed: {str(e)}")

    return CreateOrderResponse(
        order_id=order["id"],
        amount=order["amount"],
        currency=order["currency"],
        key_id=RAZORPAY_KEY_ID,
    )


@router.post("/verify", response_model=VerifyPaymentResponse)
def verify_payment(
    body: VerifyPaymentRequest,
    user: User = Depends(get_current_user),
    db:   Session = Depends(get_session),
):
    """
    Verifies the Razorpay payment signature (HMAC-SHA256).
    On success: sets user.is_pro = True in the database.
    Rejects tampered or fake signatures with HTTP 400.
    """
    if not RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=503, detail="Payment verification not configured.")

    # ── HMAC-SHA256 Signature Verification ───────────────────────────────────
    # Razorpay standard: signature = HMAC(order_id + "|" + payment_id)
    expected_message = f"{body.razorpay_order_id}|{body.razorpay_payment_id}"
    expected_signature = hmac.new(
        key=RAZORPAY_KEY_SECRET.encode("utf-8"),
        msg=expected_message.encode("utf-8"),
        digestmod=hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected_signature, body.razorpay_signature):
        raise HTTPException(
            status_code=400,
            detail="Invalid payment signature. Possible tampering detected."
        )

    # ── Upgrade user to Pro ───────────────────────────────────────────────────
    db_user = db.get(User, user.id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found.")

    db_user.is_pro = True
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    print(f"✅ Pro upgrade: {db_user.email} (payment: {body.razorpay_payment_id})")

    return VerifyPaymentResponse(
        success=True,
        message="Payment verified. You are now a Pro member! 🎉",
        is_pro=True,
    )


@router.get("/status")
def payment_status(user: User = Depends(get_current_user)):
    """Returns the current user's Pro status."""
    return {
        "user_id": user.id,
        "email":   user.email,
        "is_pro":  user.is_pro,
        "plan":    "Pro" if user.is_pro else "Free",
    }

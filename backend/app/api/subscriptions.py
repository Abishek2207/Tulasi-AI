from fastapi import APIRouter, Depends, HTTPException, Request
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone

from app.core.database import get_session
from app.models.models import User, Subscription, Coupon, CouponRedemption, UsageLog
from app.api.deps import get_current_user
from app.core.rate_limit import limiter

router = APIRouter()

# Fixed plans since they are hardcoded in business logic
DEFAULT_PLANS = [
    {"name": "Student", "price": 500, "ai_requests_limit": 50, "features": ["Basic ATS", "5 Resumes/mo"]},
    {"name": "Professional", "price": 700, "ai_requests_limit": 500, "features": ["Advanced ATS", "20 Resumes/mo", "Priority Support"]}
]

@router.get("/plans")
def get_plans():
    return DEFAULT_PLANS

class ApplyCouponRequest(BaseModel):
    code: str
    plan_name: str

@router.post("/apply-coupon")
@limiter.limit("10/minute")
def apply_coupon(request: Request, req: ApplyCouponRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_session)):
    coupon = db.exec(select(Coupon).where(Coupon.code == req.code, Coupon.is_active == True)).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Invalid or expired coupon")
    
    if coupon.target_plan != "All" and coupon.target_plan.lower() != req.plan_name.lower():
        raise HTTPException(status_code=400, detail=f"Coupon only valid for {coupon.target_plan} plan")
        
    if coupon.usage_limit > 0 and coupon.current_usage >= coupon.usage_limit:
        raise HTTPException(status_code=400, detail="Coupon usage limit reached")
        
    # Check if user already redeemed
    redemption = db.exec(select(CouponRedemption).where(CouponRedemption.coupon_id == coupon.id, CouponRedemption.user_id == current_user.id)).first()
    if redemption:
        raise HTTPException(status_code=400, detail="You have already used this coupon")
        
    # Find base price
    base_price = next((p["price"] for p in DEFAULT_PLANS if p["name"].lower() == req.plan_name.lower()), None)
    if base_price is None:
        raise HTTPException(status_code=404, detail="Plan not found")
        
    discounted_price = max(0, base_price - (base_price * coupon.discount_percent / 100))
    return {
        "original_price": base_price,
        "discounted_price": discounted_price,
        "discount_percent": coupon.discount_percent
    }


@router.get("/my-subscription")
def get_my_subscription(current_user: User = Depends(get_current_user), db: Session = Depends(get_session)):
    """Returns current user's active subscription including AutoPay status and billing details."""
    # Return the most recent non-free subscription (any status)
    sub = db.exec(
        select(Subscription).where(
            Subscription.user_id == current_user.id,
        ).order_by(Subscription.created_at.desc())
    ).first()

    # Also try to find an active one specifically
    active_sub = db.exec(
        select(Subscription).where(
            Subscription.user_id == current_user.id,
            Subscription.status.in_(["active", "authenticated"]),
        ).order_by(Subscription.created_at.desc())
    ).first()

    # Prefer active, fall back to most recent
    sub = active_sub or sub

    plan_info = None
    if sub:
        plan_info = next((p for p in DEFAULT_PLANS if p["name"].lower() == sub.plan.lower()), None)

    # Count today's usage
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    from sqlmodel import func
    usage_today = db.exec(
        select(func.count(UsageLog.id)).where(
            UsageLog.user_id == current_user.id,
            UsageLog.created_at >= today_start
        )
    ).one()

    return {
        "has_subscription": sub is not None and sub.status in ("active", "authenticated"),
        "is_pro": current_user.is_pro,
        "plan": plan_info,
        "membership_id": sub.membership_id if sub else None,
        "subscription_status": sub.status if sub else "free",
        "auto_renew": sub.auto_renew if sub else False,
        "provider_payment_method": sub.provider_payment_method if sub else None,
        "ai_usage_today": usage_today,
        "started_at": sub.started_at.isoformat() if sub and sub.started_at else None,
        "ends_at": sub.expires_at.isoformat() if sub and sub.expires_at else None,
        "next_billing_at": sub.next_billing_at.isoformat() if sub and sub.next_billing_at else None,
    }

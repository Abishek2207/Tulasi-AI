from fastapi import APIRouter, Depends, HTTPException, Request
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone

from app.core.database import get_session
from app.models.models import User, SubscriptionPlan, UserSubscription, Coupon, CouponRedemption, UsageLog
from app.api.deps import get_current_user
from app.core.rate_limit import limiter

router = APIRouter()

@router.get("/plans")
def get_plans(db: Session = Depends(get_session)):
    query = select(SubscriptionPlan).where(SubscriptionPlan.is_active == True)
    plans = db.exec(query).all()
    if not plans:
        # Seed default plans if they don't exist
        default_plans = [
            SubscriptionPlan(name="Student", price=99, ai_requests_limit=10, resume_downloads_limit=5, features_json='["Basic ATS", "5 Resumes/mo"]'),
            SubscriptionPlan(name="Professional", price=249, ai_requests_limit=50, resume_downloads_limit=20, features_json='["Advanced ATS", "20 Resumes/mo", "Priority Support"]'),
            SubscriptionPlan(name="Enterprise", price=999, ai_requests_limit=1000, resume_downloads_limit=1000, features_json='["Unlimited ATS", "Unlimited Resumes", "Dedicated API"]')
        ]
        db.add_all(default_plans)
        db.commit()
        plans = default_plans
    return plans

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
        
    plan = db.exec(select(SubscriptionPlan).where(SubscriptionPlan.name == req.plan_name)).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
        
    discounted_price = max(0, plan.price - (plan.price * coupon.discount_percent / 100))
    return {
        "original_price": plan.price,
        "discounted_price": discounted_price,
        "discount_percent": coupon.discount_percent
    }


@router.get("/my-subscription")
def get_my_subscription(current_user: User = Depends(get_current_user), db: Session = Depends(get_session)):
    """Returns current user's active subscription and usage stats."""
    sub = db.exec(
        select(UserSubscription).where(
            UserSubscription.user_id == current_user.id,
            UserSubscription.status == "active"
        )
    ).first()

    plan_info = None
    if sub:
        plan = db.exec(select(SubscriptionPlan).where(SubscriptionPlan.id == sub.plan_id)).first()
        if plan:
            plan_info = {"name": plan.name, "price": plan.price, "ai_requests_limit": plan.ai_requests_limit}

    # Count today's usage
    from datetime import datetime
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    from sqlmodel import func
    usage_today = db.exec(
        select(func.count()).where(
            UsageLog.user_id == current_user.id,
            UsageLog.created_at >= today_start
        )
    ).one()

    return {
        "has_subscription": sub is not None,
        "is_pro": current_user.is_pro,
        "plan": plan_info,
        "subscription_status": sub.status if sub else "free",
        "ai_usage_today": usage_today,
        "started_at": sub.started_at.isoformat() if sub and sub.started_at else None,
        "ends_at": sub.ends_at.isoformat() if sub and sub.ends_at else None,
    }

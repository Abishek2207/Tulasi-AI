from fastapi import APIRouter, Depends, HTTPException, Request
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import uuid

from app.core.database import get_session
from app.models.models import User, Payment, SubscriptionPlan, UserSubscription, Coupon, CouponRedemption
from app.api.deps import get_current_user
from app.core.rate_limit import limiter

router = APIRouter()

class CheckoutRequest(BaseModel):
    plan_id: int
    coupon_code: Optional[str] = None

@router.post("/checkout")
@limiter.limit("5/minute")
def create_checkout(request: Request, req: CheckoutRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_session)):
    plan = db.exec(select(SubscriptionPlan).where(SubscriptionPlan.id == req.plan_id)).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
        
    final_amount = plan.price
    coupon = None
    if req.coupon_code:
        coupon = db.exec(select(Coupon).where(Coupon.code == req.coupon_code, Coupon.is_active == True)).first()
        if coupon and (coupon.target_plan == "All" or coupon.target_plan == plan.name) and coupon.current_usage < coupon.usage_limit:
            final_amount = max(0, plan.price - (plan.price * coupon.discount_percent / 100))
            
    # Mock Razorpay Order Creation
    order_id = f"order_{uuid.uuid4().hex[:10]}"
    
    payment = Payment(
        user_id=current_user.id,
        amount=final_amount,
        currency="INR",
        status="pending",
        razorpay_order_id=order_id
    )
    db.add(payment)
    db.commit()
    
    return {
        "order_id": order_id,
        "amount": final_amount,
        "currency": "INR",
        "name": f"TulasiAI {plan.name} Plan",
        "description": "Unlock premium features",
        "key": "rzp_test_dummy_key" # Placeholder
    }

class VerifyPaymentRequest(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str
    plan_id: int
    coupon_code: Optional[str] = None

@router.post("/verify")
def verify_payment(req: VerifyPaymentRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_session)):
    payment = db.exec(select(Payment).where(Payment.razorpay_order_id == req.razorpay_order_id)).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment order not found")
        
    # Mock signature verification
    payment.status = "success"
    payment.razorpay_payment_id = req.razorpay_payment_id
    payment.razorpay_signature = req.razorpay_signature
    db.add(payment)
    
    # Apply coupon logic
    if req.coupon_code:
        coupon = db.exec(select(Coupon).where(Coupon.code == req.coupon_code)).first()
        if coupon:
            coupon.current_usage += 1
            db.add(coupon)
            redemption = CouponRedemption(coupon_id=coupon.id, user_id=current_user.id)
            db.add(redemption)
            
    # Activate subscription
    # Cancel old subscription if any
    old_sub = db.exec(select(UserSubscription).where(UserSubscription.user_id == current_user.id, UserSubscription.status == "active")).first()
    if old_sub:
        old_sub.status = "cancelled"
        db.add(old_sub)
        
    new_sub = UserSubscription(
        user_id=current_user.id,
        plan_id=req.plan_id,
        status="active"
    )
    db.add(new_sub)
    db.commit()
    
    return {"message": "Payment verified and subscription activated"}

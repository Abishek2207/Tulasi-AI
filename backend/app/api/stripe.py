import os
import logging
from fastapi import APIRouter, Depends, Request, HTTPException
from sqlmodel import Session, select
from app.core.database import get_session
from app.core.security import get_current_user
from app.models.models import User

logger = logging.getLogger(__name__)

try:
    import stripe
    STRIPE_AVAILABLE = True
except ImportError:
    stripe = None
    STRIPE_AVAILABLE = False
    logger.warning("stripe package not installed — Stripe endpoints will fail")

stripe_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_dummy")
if STRIPE_AVAILABLE and stripe:
    stripe.api_key = stripe_key
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "whsec_dummy")

router = APIRouter()

@router.post("/create-checkout-session")
def create_checkout_session(request: Request, user: User = Depends(get_current_user), db: Session = Depends(get_session)):
    if not STRIPE_AVAILABLE or not stripe:
        raise HTTPException(status_code=503, detail="Stripe is not configured on the server.")
        
    try:
        frontend_url = os.getenv("FRONTEND_URL", "https://tulasiai.in").rstrip("/")
        
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "inr",
                    "product_data": {
                        "name": "Tulasi AI Pro",
                        "description": "Unlimited Chat, Interviews & Resume Analytics"
                    },
                    "unit_amount": 199900, # ₹1999.00
                    "recurring": {"interval": "year"}
                },
                "quantity": 1,
            }],
            mode="subscription",
            success_url=f"{frontend_url}/dashboard?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{frontend_url}/dashboard",
            client_reference_id=str(user.id),
            customer_email=user.email
        )
        return {"checkout_url": session.url}
    except Exception as e:
        logger.error(f"Stripe session creation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/customer-portal")
def create_customer_portal_session(user: User = Depends(get_current_user), db: Session = Depends(get_session)):
    if not STRIPE_AVAILABLE or not stripe:
        raise HTTPException(status_code=503, detail="Stripe is not configured.")
        
    if not user.stripe_customer_id:
        raise HTTPException(status_code=400, detail="User is not a Pro member or has no Stripe customer record.")
        
    try:
        frontend_url = os.getenv("FRONTEND_URL", "https://tulasiai.in").rstrip("/")
        session = stripe.billing_portal.Session.create(
            customer=user.stripe_customer_id,
            return_url=f"{frontend_url}/dashboard"
        )
        return {"portal_url": session.url}
    except Exception as e:
        logger.error(f"Stripe portal creation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_session)):
    if not STRIPE_AVAILABLE or not stripe:
        return {"status": "error", "message": "Stripe missing"}
        
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")
    
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
    except Exception as e:
        logger.error(f"Stripe webhook signature verification failed: {e}")
        raise HTTPException(status_code=400, detail="Webhook verification failed")

    try:
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            user_id = session.get('client_reference_id')
            if user_id:
                db_user = db.get(User, int(user_id))
                if db_user:
                    db_user.is_pro = True
                    db_user.stripe_customer_id = session.get('customer')
                    db_user.stripe_subscription_id = session.get('subscription')
                    db.add(db_user)
                    db.commit()
                    logger.info(f"User {db_user.id} upgraded to Pro.")

        elif event['type'] == 'customer.subscription.deleted':
            sub = event['data']['object']
            customer_id = sub.get('customer')
            if customer_id:
                statement = select(User).where(User.stripe_customer_id == customer_id)
                users = db.exec(statement).all()
                for u in users:
                    u.is_pro = False
                    u.stripe_subscription_id = None
                    db.add(u)
                db.commit()
                logger.info(f"Subscription deleted for customer {customer_id}.")
                
    except Exception as e:
        logger.error(f"Error processing webhook {event['type']}: {e}")
        raise HTTPException(status_code=500, detail="Error processing webhook")

    return {"status": "success"}

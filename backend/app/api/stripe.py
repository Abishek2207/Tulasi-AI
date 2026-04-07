import os
try:
    import stripe
    STRIPE_AVAILABLE = True
except ImportError:
    stripe = None
    STRIPE_AVAILABLE = False
    print("⚠️  stripe package not installed — Stripe endpoints will return 503")
from fastapi import APIRouter, Depends, Request, HTTPException
from sqlmodel import Session
from app.core.database import get_session
from app.core.security import get_current_user
from app.models.models import User

stripe_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_dummy_key_change_me")
if STRIPE_AVAILABLE and stripe:
    stripe.api_key = stripe_key
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "whsec_dummy_secret_change_me")

router = APIRouter()

@router.post("/create-checkout-session")
def create_checkout_session(request: Request, user: User = Depends(get_current_user), db: Session = Depends(get_session)):
    try:
        frontend_url = os.getenv("FRONTEND_URL", "https://tulasiai.in")
        # Define the Pro Plan price ID or use an inline price data object
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "usd",
                    "product_data": {"name": "Tulasi AI Pro", "description": "Unlimited Chat, Interviews & Resume Analytics"},
                    "unit_amount": 999, # $9.99
                    "recurring": {"interval": "month"}
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
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_session)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")
    
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
    except Exception as e:
        return {"status": "Webhook verification failed", "error": str(e)}

    # Handle subscription events
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

    elif event['type'] == 'customer.subscription.deleted':
        sub = event['data']['object']
        customer_id = sub.get('customer')
        # We must find the user by customer_id
        # Simplistic approach (in prod use a proper query helper):
        users = db.query(User).filter(User.stripe_customer_id == customer_id).all()
        for u in users:
            u.is_pro = False
            db.add(u)
        db.commit()

    return {"status": "success"}

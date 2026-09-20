import secrets
import string
from sqlmodel import Session, select
from typing import Optional
from app.models.models import Subscription

def generate_random_suffix(length: int = 6) -> str:
    """Generate a random alphanumeric string of a given length."""
    alphabet = string.ascii_uppercase + string.digits
    # Exclude confusing characters if desired, but standard alphanumeric is fine.
    # Exclude 0, O, I, 1 to prevent reading mistakes
    clean_alphabet = "".join([c for c in alphabet if c not in ('0', 'O', 'I', '1')])
    return ''.join(secrets.choice(clean_alphabet) for _ in range(length))

def generate_membership_id(db: Session, plan: str, max_retries: int = 5) -> str:
    """
    Generate a unique membership ID based on the plan.
    Student: TUL-STU-{random}
    Professional: TUL-PRO-{random}
    """
    prefix = "TUL-STU" if plan.lower() == "student" else "TUL-PRO"
    
    for _ in range(max_retries):
        candidate_id = f"{prefix}-{generate_random_suffix()}"
        # Check uniqueness in DB
        existing = db.exec(select(Subscription).where(Subscription.membership_id == candidate_id)).first()
        if not existing:
            return candidate_id
            
    raise Exception("Failed to generate a unique membership ID after max retries")

from sqlmodel import Session, create_engine, select
from app.models.models import Review
import os

# Database connection
DATABASE_URL = "sqlite:///tulasi_ai.db"
engine = create_engine(DATABASE_URL)

def check_reviews():
    with Session(engine) as session:
        reviews = session.exec(select(Review)).all()
        print(f"Total Reviews: {len(reviews)}")
        for r in reviews:
            # Print ID, Name, and first 40 chars of review
            print(f"ID: {r.id} | Name: {r.name} | Approved: {r.is_approved} | Review: {r.review[:40]}...")

if __name__ == "__main__":
    check_reviews()

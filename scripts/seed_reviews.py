import sys
import os
from datetime import datetime
from sqlmodel import Session, create_engine, SQLModel

# Add the backend directory to sys.path to allow imports from app
backend_path = os.path.join(os.getcwd(), "backend")
sys.path.append(backend_path)

from app.models.models import Review
from app.core.config import settings

def seed_reviews():
    print("🚀 Starting Review Seeding...")
    
    # Use the normalized database URL from settings
    engine = create_engine(settings.normalized_database_url)
    
    reviews_data = [
        {
            "name": "Alex Chen",
            "role": "Software Engineer",
            "review": "Tulasi AI has completely changed how I prepare for my coding interviews. The AI mock interviews are incredibly realistic and the feedback is spot on!",
            "rating": 5,
            "is_featured": True
        },
        {
            "name": "Samantha Lee",
            "role": "Frontend Developer",
            "review": "The roadmap feature is a lifesaver. It broke down complex topics like System Design into manageable steps that actually made sense for my career path.",
            "rating": 5,
            "is_featured": True
        },
        {
            "name": "Jordan Davis",
            "role": "CS Student",
            "review": "I love the community aspect. Finding a study group for FAANG prep was so easy and the members are very supportive. The streak system keeps me motivated!",
            "rating": 4,
            "is_featured": True
        },
        {
            "name": "Marcus Johnson",
            "role": "Backend Engineer",
            "review": "The resume builder's ATS optimization is top-notch. I started getting more callbacks from top-tier companies immediately after using the suggested improvements.",
            "rating": 5,
            "is_featured": True
        },
        {
            "name": "Elena Rodriguez",
            "role": "Web Developer",
            "review": "A must-have tool for any aspiring developer. The personalized learning paths are what sets it apart from other platforms. It's like having a senior mentor 24/7.",
            "rating": 5,
            "is_featured": True
        },
        {
            "name": "Chris Taylor",
            "role": "Full Stack Developer",
            "review": "The AI chat is surprisingly intelligent and actually understands the context of my code snippets. It helped me debug a complex state management issue in minutes.",
            "rating": 4,
            "is_featured": True
        },
        {
            "name": "David Kim",
            "role": "Mobile App Developer",
            "review": "Tulasi AI's hackathon discovery tool helped my team find the perfect project to work on last month. The platform is sleek, fast, and incredibly useful.",
            "rating": 5,
            "is_featured": True
        }
    ]

    with Session(engine) as session:
        # Clear existing seeded reviews to avoid duplicates if needed, or just add new ones
        # For now, let's just add them.
        
        for data in reviews_data:
            review = Review(
                name=data["name"],
                role=data["role"],
                review=data["review"],
                rating=data["rating"],
                is_featured=data["is_featured"],
                created_at=datetime.utcnow()
            )
            session.add(review)
        
        session.commit()
        print(f"✅ Successfully seeded {len(reviews_data)} high-quality reviews!")

if __name__ == "__main__":
    seed_reviews()

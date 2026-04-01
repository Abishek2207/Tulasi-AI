import sqlite3
import os
import time
from datetime import datetime

# Correct database path relative to backend dir or root
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend", "tulasi_ai.db")

def seed_reviews():
    print(f"🚀 Starting Review Seeding... connecting to {DB_PATH}")
    
    if not os.path.exists(DB_PATH):
        print(f"❌ Database not found at {DB_PATH}")
        return

    # Use a large timeout in case the database is temporarily locked by another process
    conn = sqlite3.connect(DB_PATH, timeout=20.0)
    cur = conn.cursor()
    
    try:
        # Clear existing reviews first
        print("🗑️ Clearing existing reviews...")
        cur.execute("DELETE FROM review;")
        
        reviews_data = [
            {
                "name": "Alex Chen",
                "role": "Software Engineer",
                "review": "Tulasi AI has completely changed how I prepare for my coding interviews. The AI mock interviews are incredibly realistic and the feedback is spot on!",
                "rating": 5,
                "is_featured": 1
            },
            {
                "name": "Samantha Lee",
                "role": "Frontend Developer",
                "review": "The roadmap feature is a lifesaver. It broke down complex topics like System Design into manageable steps that actually made sense for my career path.",
                "rating": 5,
                "is_featured": 1
            },
            {
                "name": "Jordan Davis",
                "role": "CS Student",
                "review": "I love the community aspect. Finding a study group for FAANG prep was so easy and the members are very supportive. The streak system keeps me motivated!",
                "rating": 4,
                "is_featured": 1
            },
            {
                "name": "Marcus Johnson",
                "role": "Backend Engineer",
                "review": "The resume builder's ATS optimization is top-notch. I started getting more callbacks from top-tier companies immediately after using the suggested improvements.",
                "rating": 5,
                "is_featured": 1
            },
            {
                "name": "Elena Rodriguez",
                "role": "Web Developer",
                "review": "A must-have tool for any aspiring developer. The personalized learning paths are what sets it apart from other platforms. It's like having a senior mentor 24/7.",
                "rating": 5,
                "is_featured": 1
            },
            {
                "name": "Chris Taylor",
                "role": "Full Stack Developer",
                "review": "The AI chat is surprisingly intelligent and actually understands the context of my code snippets. It helped me debug a complex state management issue in minutes.",
                "rating": 4,
                "is_featured": 1
            },
            {
                "name": "David Kim",
                "role": "Mobile App Developer",
                "review": "Tulasi AI's hackathon discovery tool helped my team find the perfect project to work on last month. The platform is sleek, fast, and incredibly useful.",
                "rating": 5,
                "is_featured": 1
            }
        ]
        
        insert_query = """
        INSERT INTO review (user_id, name, email, role, review, rating, is_featured, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """
        
        print("✍️ Inserting 7 high-quality reviews...")
        for data in reviews_data:
            created_at = datetime.utcnow().isoformat()
            cur.execute(
                insert_query,
                (None, data["name"], None, data["role"], data["review"], data["rating"], data["is_featured"], created_at)
            )

        conn.commit()
        print(f"✅ Successfully seeded {len(reviews_data)} high-quality reviews!")
        
    except sqlite3.OperationalError as e:
        print(f"❌ Database error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    seed_reviews()

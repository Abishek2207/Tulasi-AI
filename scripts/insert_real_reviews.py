import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'backend', 'tulasi_ai.db')
if not os.path.exists(DB_PATH):
    # Try alternate location
    DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'tulasi_ai.db')

def seed_real_reviews():
    print(f"Connecting to DB at: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    REAL_REVIEWS = [
        {"name": "Gurucharan", "role": None, "review": "GOOD NOT BAD", "rating": 5},
        {"name": "KRISHNA", "role": "STUDENT", "review": "Really amazing....!!!!", "rating": 5},
        {"name": "Aadhi", "role": "PAAVAI", "review": "It is incredibly easy for beginners to learn, yet powerful enough to handle the complex needs of advanced users", "rating": 5},
        {"name": "Bharat", "role": "Student@Paavai", "review": "All in one AI excellent for beginners", "rating": 5},
        {"name": "Yogeshwaran", "role": "Student@Paavai", "review": "Good features ❤️🔥", "rating": 5},
        {"name": "Santhosh", "role": "Designer@Airbus", "review": "Tulsi AI is an outstanding platform that perfectly balances simplicity and power. Its intuitive design makes it incredibly accessible for beginners, while its robust features provide all the depth that advanced users need. Highly recommended", "rating": 5},
        {"name": "Krishna", "role": None, "review": "Excellent Platform", "rating": 5},
        {"name": "Abdul", "role": "student", "review": "this AI will beat the open AI", "rating": 5},
        {"name": "Hami", "role": None, "review": "Really, It's amazing to use this website👌!!!", "rating": 5},
        {"name": "Abhimanyu S S", "role": "Student@PEC", "review": "Excellent platform for Students🔥🔥", "rating": 5},
    ]

    # Ensure table exists (safeguard)
    # The actual schema migration will run on backend startup, 
    # but we will just insert manually, adding columns if we need to.
    
    # We will let the backend startup add the `is_approved` column for us if it isn't there yet,
    # OR we can add it here if it's missing just to be safe.
    try:
        cursor.execute("ALTER TABLE review ADD COLUMN is_approved BOOLEAN DEFAULT 0")
        print("Added is_approved column to review table.")
    except Exception:
        pass # Column might already exist

    try:
        cursor.execute("UPDATE review SET is_approved = 1")
        print("Marked all existing reviews as approved by default.")
    except Exception as e:
        print("Could not update existing reviews:", e)

    # Clean existing fake reviews, only keeping the 10 real ones? 
    # The requirement is "Insert ONLY these real reviews into the database as approved... Do NOT delete them in future."
    # Let's delete ALL currently existing reviews to give a fresh start to the "Real Reviews Only" policy
    cursor.execute("DELETE FROM review")
    print("Cleared `review` table to insert the Real Reviews.")

    from datetime import datetime

    for r in REAL_REVIEWS:
        cursor.execute(
            """
            INSERT INTO review (name, role, review, rating, is_featured, is_approved, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (r['name'], r['role'], r['review'], r['rating'], 0, 1, datetime.utcnow())
        )
    
    conn.commit()
    print(f"Successfully inserted {len(REAL_REVIEWS)} real reviews!")
    conn.close()

if __name__ == "__main__":
    seed_real_reviews()

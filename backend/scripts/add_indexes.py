from sqlmodel import Session, create_engine, text
import os
from dotenv import load_dotenv

# Load env vars
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("❌ DATABASE_URL not found in environment")
    exit(1)

# Use the same engine logic as the app
engine = create_engine(DATABASE_URL)

def add_indexes():
    queries = [
        # UserFollow indexes
        "CREATE INDEX IF NOT EXISTS idx_userfollow_follower_id ON userfollow (follower_id)",
        "CREATE INDEX IF NOT EXISTS idx_userfollow_following_id ON userfollow (following_id)",
        "CREATE INDEX IF NOT EXISTS idx_userfollow_status ON userfollow (status)",
        
        # IdeaLike indexes
        "CREATE INDEX IF NOT EXISTS idx_idealike_idea_id ON idealike (idea_id)",
        "CREATE INDEX IF NOT EXISTS idx_idealike_user_id ON idealike (user_id)",
        
        # Idea indexes
        "CREATE INDEX IF NOT EXISTS idx_idea_user_id ON idea (user_id)",
        "CREATE INDEX IF NOT EXISTS idx_idea_created_at ON idea (created_at DESC)",
        
        # User indexes
        "CREATE INDEX IF NOT EXISTS idx_user_username ON \"user\" (username)",
        "CREATE INDEX IF NOT EXISTS idx_user_email ON \"user\" (email)"
    ]
    
    with Session(engine) as session:
        for query in queries:
            try:
                print(f"Executing: {query}")
                session.execute(text(query))
                session.commit()
                print("✅ Success")
            except Exception as e:
                print(f"⚠️ Failed: {e}")

if __name__ == "__main__":
    add_indexes()

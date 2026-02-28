import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Initialize the Supabase client
def get_db_client() -> Client | None:
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("Warning: Supabase credentials not found in environment variables.")
        return None
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        return supabase
    except Exception as e:
        print(f"Failed to connect to Supabase: {e}")
        return None

db = get_db_client()

# Utility functions for core tasks
def create_user(email: str, user_id: str, name: str):
    if not db: return None
    try:
        data = db.table("users").insert({
            "id": user_id, 
            "email": email, 
            "name": name,
            "streak": 0
        }).execute()
        return data
    except Exception as e:
        print(f"Error creating user: {e}")
        return None

def save_chat_history(user_id: str, message: str, role: str):
    if not db: return None
    try:
        db.table("chat_history").insert({
            "user_id": user_id,
            "message": message,
            "role": role # 'user' or 'ai'
        }).execute()
    except Exception as e:
        print(f"Error saving chat: {e}")

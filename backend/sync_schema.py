
import sqlite3
import os

def sync_schema():
    db_path = os.path.join(os.path.dirname(__file__), 'tulasi_ai.db')
    if not os.path.exists(db_path):
        print(f"DB not found at {db_path}")
        return
        
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check current columns in 'user' table
    cursor.execute("PRAGMA table_info(\"user\");")
    columns = [col[1] for col in cursor.fetchall()]
    
    # Add missing columns
    if "is_pro" not in columns:
        print("Adding 'is_pro' column...")
        cursor.execute("ALTER TABLE \"user\" ADD COLUMN is_pro BOOLEAN DEFAULT 1;")
    
    if "chats_today" not in columns:
        print("Adding 'chats_today' column...")
        cursor.execute("ALTER TABLE \"user\" ADD COLUMN chats_today INTEGER DEFAULT 0;")
        
    if "last_reset_date" not in columns:
        print("Adding 'last_reset_date' column...")
        cursor.execute("ALTER TABLE \"user\" ADD COLUMN last_reset_date TEXT;")
        
    if "pro_expiry_date" not in columns:
        print("Adding 'pro_expiry_date' column...")
        cursor.execute("ALTER TABLE \"user\" ADD COLUMN pro_expiry_date TEXT;")

    conn.commit()
    print("Schema synchronized successfully!")
    conn.close()

if __name__ == "__main__":
    sync_schema()

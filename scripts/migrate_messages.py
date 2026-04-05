import sqlite3
import os

db_path = "tulasi_ai.db"

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # 1. Check if column already exists
    cursor.execute("PRAGMA table_info(directmessage)")
    columns = [c[1] for c in cursor.fetchall()]
    
    try:
        if "is_seen" not in columns:
            print("Adding is_seen to directmessage...")
            cursor.execute("ALTER TABLE directmessage ADD COLUMN is_seen BOOLEAN DEFAULT 0")
        if "seen_at" not in columns:
            print("Adding seen_at to directmessage...")
            cursor.execute("ALTER TABLE directmessage ADD COLUMN seen_at DATETIME")
            
        conn.commit()
        print("✅ Migration successful.")
    except Exception as e:
        print(f"⚠️ Error: {e}")
    finally:
        conn.close()
else:
    print(f"❌ Database not found at {db_path}")

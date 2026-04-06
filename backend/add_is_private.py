import sqlite3
import os

DB_PATH = "C:/Users/Admin/Downloads/Desktop/Project/TulasiAI/backend/tulasi_ai.db"

if not os.path.exists(DB_PATH):
    print(f"Error: {DB_PATH} not found!")
    exit(1)

try:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Check if column exists
    cursor.execute("PRAGMA table_info(user)")
    columns = [col[1] for col in cursor.fetchall()]
    if "is_private" in columns:
        print("Column 'is_private' already exists!")
    else:
        cursor.execute("ALTER TABLE user ADD COLUMN is_private BOOLEAN DEFAULT 0")
        print("Successfully added 'is_private' column to user table.")
    conn.commit()
    conn.close()
except Exception as e:
    print(f"Migration error: {e}")

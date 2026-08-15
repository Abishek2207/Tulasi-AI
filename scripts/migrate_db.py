import sqlite3
import os

db_path = 'backend/tulasi_ai.db'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    try:
        cur.execute("ALTER TABLE user ADD COLUMN preferred_model VARCHAR DEFAULT 'gemini'")
        print('Added preferred_model column')
    except Exception as e:
        print('Column might already exist:', e)
    conn.commit()
    conn.close()
else:
    print('DB not found, it will be recreated')

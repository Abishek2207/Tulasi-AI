import sqlite3
import os

db_path = "backend/tulasi_ai.db"

if not os.path.exists(db_path):
    print(f"❌ Database not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cur = conn.cursor()

print("🔍 Current Reviews in DB:")
cur.execute("SELECT id, name, role, review FROM review;")
rows = cur.fetchall()

if not rows:
    print("Empty table.")
else:
    for row in rows:
        print(f"ID: {row[0]} | Name: {row[1]} | Role: {row[2]}")
        print(f"Content: {row[3][:50]}...")
        print("-" * 20)

conn.close()

import sqlite3
import os

db_path = "backend/tulasi_ai.db"

if not os.path.exists(db_path):
    print(f"❌ Database not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cur = conn.cursor()

# Known fake names from frontend placeholders
fake_names = ["Arjun Mehta", "Sarah Chen", "Vikram Singh", "Student"]

print("🔍 Inspecting reviews...")
cur.execute("SELECT id, name, role FROM review;")
rows = cur.fetchall()

to_delete = []
for row in rows:
    rid, name, role = row
    if name in fake_names or (role and "Google" in role) or (role and "Meta" in role):
        to_delete.append(rid)
        print(f"🗑️ Marking fake review for deletion: {name} ({role})")

if to_delete:
    print(f"✅ Deleting {len(to_delete)} fake reviews...")
    cur.execute(f"DELETE FROM review WHERE id IN ({','.join(map(str, to_delete))});")
    conn.commit()
    print("✨ Cleanup complete!")
else:
    print("✌️ No fake reviews found in database.")

conn.close()

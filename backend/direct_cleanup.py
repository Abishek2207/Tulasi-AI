
import sqlite3
import os

def direct_cleanup():
    db_path = 'tulasi_ai.db'
    if not os.path.exists(db_path):
        print(f"❌ Database not found at {db_path}")
        return

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # 1. Promote Admin
        admin_email = 'abishekramamoorthy22@gmail.com'
        cursor.execute("UPDATE user SET role = 'admin' WHERE email = ?", (admin_email,))
        if cursor.rowcount > 0:
            print(f"✅ User {admin_email} promoted to admin.")
        else:
            print(f"❓ User {admin_email} not found or already admin.")

        # 2. Delete Spam
        cursor.execute("DELETE FROM review WHERE review LIKE '%mia kalifa%'")
        if cursor.rowcount > 0:
            print(f"🗑️ Deleted {cursor.rowcount} spam reviews.")
        else:
            print("✨ No spam reviews found.")

        conn.commit()
        conn.close()
        print("🚀 Database cleanup complete.")

    except Exception as e:
        print(f"❌ Error during cleanup: {e}")

if __name__ == "__main__":
    direct_cleanup()

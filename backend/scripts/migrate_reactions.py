import sqlite3
import os

db_path = "tulasi_ai.db"

def migrate():
    if not os.path.exists(db_path):
        print(f"Database {db_path} not found.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Add reactions_json and reply_to_id columns to directmessage
        print("Migrating directmessage table...")
        cursor.execute("ALTER TABLE directmessage ADD COLUMN reactions_json VARCHAR DEFAULT '[]'")
        cursor.execute("ALTER TABLE directmessage ADD COLUMN reply_to_id INTEGER")
        print("Success: Columns added.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("Columns already exist.")
        else:
            print(f"Error during migration: {e}")
    finally:
        conn.commit()
        conn.close()

if __name__ == "__main__":
    migrate()

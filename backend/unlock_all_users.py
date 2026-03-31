
import sqlite3
import os

def unlock_all():
    db_path = os.path.join(os.path.dirname(__file__), 'tulasi_ai.db')
    if not os.path.exists(db_path):
        print(f"DB not found at {db_path}")
        return
        
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Update all users to be PRO and reset chats
    cursor.execute("UPDATE user SET is_pro = 1, chats_today = 0;")
    conn.commit()
    
    rows_affected = cursor.rowcount
    print(f"Successfully unlocked {rows_affected} users and set them to Platinum Pro!")
    conn.close()

if __name__ == "__main__":
    unlock_all()


import sqlite3

def check_tables():
    conn = sqlite3.connect('tulasi_ai.db')
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print(f"Tables in DB: {tables}")
    
    for table_name in [t[0] for t in tables]:
        print(f"\n--- {table_name} ---")
        cursor.execute(f"PRAGMA table_info({table_name});")
        cols = cursor.fetchall()
        for col in cols:
            print(col)
    
    conn.close()

if __name__ == "__main__":
    check_tables()

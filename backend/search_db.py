import sqlite3

def search_db(db_path):
    print(f"Searching database: {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [row[0] for row in cursor.fetchall()]
    for table in tables:
        try:
            cursor.execute(f'SELECT * FROM "{table}"')
            columns = [description[0] for description in cursor.description]
            rows = cursor.fetchall()
            for i, row in enumerate(rows):
                row_str = str(row)
                if 'sriharsha' in row_str.lower():
                    print(f"Found in table {table}, row {i}:")
                    for col, val in zip(columns, row):
                        print(f"  {col}: {val}")
        except Exception as e:
            print(f"Error reading table {table}: {e}")
    conn.close()

if __name__ == "__main__":
    search_db("tulasi_ai.db")
    search_db("backend/tulasi_ai.db")
    search_db("backend/tulasi.db")
    search_db("backend/test.db")

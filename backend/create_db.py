import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlmodel import SQLModel, create_engine
from app.models.models import *

# Assuming SQLite for local dev
sqlite_file_name = "tulasi_ai.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

engine = create_engine(sqlite_url, echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
    print("Database tables created/updated successfully.")

if __name__ == "__main__":
    create_db_and_tables()

import sys
import os

# Add backend directory to sys.path so we can import app modules
sys.path.append(os.path.abspath('backend'))

from sqlalchemy import create_engine
from sqlalchemy.schema import CreateTable
from app.models.models import SQLModel
from sqlalchemy.dialects import postgresql

def dump_postgres_schema():
    engine = create_engine('postgresql://dummy')
    
    with open('supabase/migrations/0001_initial_schema.sql', 'w') as f:
        f.write("-- Phase 6: Initial PostgreSQL Schema\n")
        f.write("CREATE EXTENSION IF NOT EXISTS vector;\n\n")
        
        # We need to sort tables by dependencies. 
        # For simplicity, we just use SQLModel.metadata.sorted_tables
        for table in SQLModel.metadata.sorted_tables:
            create_table_stmt = CreateTable(table).compile(engine, dialect=postgresql.dialect())
            f.write(str(create_table_stmt).strip() + ";\n\n")
            
    print("Postgres schema dumped successfully.")

if __name__ == '__main__':
    dump_postgres_schema()

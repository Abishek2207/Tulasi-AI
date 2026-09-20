import os
from sqlalchemy import create_engine, text

engine = create_engine(os.environ['DATABASE_URL'])
with engine.connect() as conn:
    # Find all tables with a user_id column
    q = """
    SELECT table_name 
    FROM information_schema.columns 
    WHERE column_name = 'user_id' 
      AND table_schema = 'public'
    """
    tables_with_user_id = [r[0] for r in conn.execute(text(q)).fetchall()]
    
    # Also find child tables that might link to a parent instead of user_id
    # e.g., documentchunk -> document_id
    # Since it's too complex to introspect foreign keys fully, let's explicitly list known ones.
    
    # Base user table uses `id`
    
    print("Tables with user_id:", tables_with_user_id)

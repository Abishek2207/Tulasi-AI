import os
from sqlalchemy import create_engine, text
engine = create_engine(os.environ['DATABASE_URL'])
with engine.connect() as conn:
    tables = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'")).fetchall()
    print('Tables:', [t[0] for t in tables])
    current_role = conn.execute(text('SELECT current_user')).scalar()
    role_info = conn.execute(text(f"SELECT rolname, rolsuper, rolbypassrls FROM pg_roles WHERE rolname = '{current_role}'")).fetchone()
    print('Current Role:', role_info)

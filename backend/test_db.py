import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__))))

from app.core.database import init_db

print("Starting Supabase database sync...")
init_db()
print("Finished Supabase database sync!")

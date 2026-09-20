import sys
import os

sys.path.append(os.path.abspath('backend'))
from app.models.models import SQLModel

def dump_rls():
    with open('supabase/migrations/0002_rls_policies.sql', 'w') as f:
        f.write("-- Phase 6: Row Level Security (RLS) Policies\n\n")
        
        for table in SQLModel.metadata.sorted_tables:
            table_name = table.name
            f.write(f"ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY;\n")
            
            # If table has user_id, restrict access to the owner
            has_user_id = any(c.name == 'user_id' for c in table.columns)
            is_user_table = table_name == 'user'
            
            if has_user_id:
                f.write(f"CREATE POLICY \"Users can view own {table_name}\" ON {table_name} FOR SELECT USING (auth.uid()::text = user_id::text);\n")
                f.write(f"CREATE POLICY \"Users can insert own {table_name}\" ON {table_name} FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);\n")
                f.write(f"CREATE POLICY \"Users can update own {table_name}\" ON {table_name} FOR UPDATE USING (auth.uid()::text = user_id::text);\n")
                f.write(f"CREATE POLICY \"Users can delete own {table_name}\" ON {table_name} FOR DELETE USING (auth.uid()::text = user_id::text);\n")
            elif is_user_table:
                f.write(f"CREATE POLICY \"Users can view own user record\" ON {table_name} FOR SELECT USING (auth.uid()::text = id::text);\n")
                f.write(f"CREATE POLICY \"Users can update own user record\" ON {table_name} FOR UPDATE USING (auth.uid()::text = id::text);\n")
            else:
                f.write(f"CREATE POLICY \"Public read access for {table_name}\" ON {table_name} FOR SELECT USING (true);\n")
            
            f.write("\n")
            
    print("RLS policies generated.")

if __name__ == '__main__':
    dump_rls()

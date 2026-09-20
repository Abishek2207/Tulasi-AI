
from app.core.database import engine
from sqlalchemy import text

print('Applying RLS policies...')
rls_tables = ['userlearningprogress', 'practiceattempt', 'assessmentattempt', 'skillevidence']
for table in rls_tables:
    try:
        with engine.begin() as conn:
            conn.execute(text(f'ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;'))
            conn.execute(text(f'''
                DO $
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM pg_policies WHERE tablename = '{table}' AND policyname = 'tenant_isolation_policy'
                    ) THEN
                        CREATE POLICY tenant_isolation_policy ON {table}
                        USING (tenant_id = current_setting('app.current_tenant', true));
                    END IF;
                END
                $;
            '''))
        print(f'Successfully applied RLS to {table}')
    except Exception as e:
        print(f'Error applying RLS to {table}: {e}')
print('Done!')


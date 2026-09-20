import sys
import json
sys.path.append('backend')
from app.core.config import settings
from sqlalchemy import create_engine, text

engine = create_engine(settings.normalized_database_url)

def get_role_info():
    with engine.begin() as conn:
        res = conn.execute(text("SELECT rolcanlogin, rolsuper, rolbypassrls FROM pg_roles WHERE rolname = 'tulasi_api'")).fetchone()
        return dict(zip(['rolcanlogin', 'rolsuper', 'rolbypassrls'], res)) if res else None

def get_rls_info():
    with engine.begin() as conn:
        tables = ('user', 'profile', 'notification', 'focussession', 'document', 'documentchunk', 'usermemorychunk')
        res = conn.execute(text(f"SELECT relname, relrowsecurity FROM pg_class WHERE relname IN {tables}"))
        return {r[0]: r[1] for r in res.fetchall()}

def get_policies():
    with engine.begin() as conn:
        tables = ('user', 'profile', 'notification', 'focussession', 'document', 'documentchunk', 'usermemorychunk')
        res = conn.execute(text(f"SELECT tablename, policyname, cmd, qual, with_check FROM pg_policies WHERE tablename IN {tables}"))
        return [dict(zip(['tablename', 'policyname', 'cmd', 'qual', 'with_check'], r)) for r in res.fetchall()]

if __name__ == '__main__':
    report = {
        'role': get_role_info(),
        'rls_enabled': get_rls_info(),
        'policies': get_policies(),
        'tests': 'BLOCKED_BY_PERMISSIONS'
    }
    print("=== RLS AUDIT REPORT ===")
    print(json.dumps(report, indent=2))

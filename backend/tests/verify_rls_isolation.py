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

def run_isolation_tests():
    with engine.begin() as conn:
        users = conn.execute(text('SELECT id FROM "user" LIMIT 2')).fetchall()
    
    if len(users) < 2:
        return {"error": "Not enough users"}
        
    userA, userB = users[0][0], users[1][0]
    results = {}
    
    # Test A: Unauthenticated
    with engine.begin() as conn:
        conn.execute(text("SET LOCAL ROLE tulasi_api"))
        resA = conn.execute(text('SELECT COUNT(*) FROM "user"')).scalar()
        results['unauthenticated_select_users'] = (resA == 0)
        
    # Test B: User A context
    with engine.begin() as conn:
        conn.execute(text("SET LOCAL ROLE tulasi_api"))
        conn.execute(text("SELECT set_config('app.current_user_id', :uid, true)"), {'uid': str(userA)})
        
        resB1 = conn.execute(text('SELECT id FROM "user"')).fetchall()
        results['userA_can_see_self'] = (len(resB1) == 1 and resB1[0][0] == userA)
        
        resB2 = conn.execute(text("SELECT user_id FROM profile")).fetchall()
        results['userA_profile_isolation'] = all(r[0] == userA for r in resB2)
        
        update_res = conn.execute(text("UPDATE profile SET bio = 'hacked' WHERE user_id = :uid RETURNING id"), {'uid': userB}).fetchall()
        results['userA_cannot_update_userB'] = len(update_res) == 0
        
        doc_res = conn.execute(text("SELECT d.user_id FROM documentchunk dc JOIN document d ON dc.document_id = d.id")).fetchall()
        results['userA_docchunk_isolation'] = all(r[0] == userA for r in doc_res)
        
        # We ROLLBACK so the update to User B (even if successful, which it shouldn't be) is never persisted
        conn.rollback()
    
    # Test C: User B context
    with engine.begin() as conn:
        conn.execute(text("SET LOCAL ROLE tulasi_api"))
        conn.execute(text("SELECT set_config('app.current_user_id', :uid, true)"), {'uid': str(userB)})
        
        resC1 = conn.execute(text('SELECT id FROM "user"')).fetchall()
        results['userB_can_see_self'] = (len(resC1) == 1 and resC1[0][0] == userB)
        
    return results

if __name__ == '__main__':
    report = {
        'role': get_role_info(),
        'rls_enabled': get_rls_info(),
        'policies': get_policies(),
        'tests': run_isolation_tests()
    }
    print("=== RLS AUDIT REPORT ===")
    print(json.dumps(report, indent=2))

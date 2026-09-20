import sys
import os
import json
from urllib.parse import urlparse
sys.path.append('backend')
from app.core.config import settings
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from sqlalchemy import event
from sqlalchemy.orm import Session as SQLAlchemySession

base_url = settings.normalized_database_url
parsed = urlparse(base_url)
netloc = parsed.netloc

if "TULASI_API_DATABASE_URL" in os.environ:
    engine_url = os.environ["TULASI_API_DATABASE_URL"]
else:
    # Construct tulasi_api pooler url
    if "postgres." in netloc:
        netloc = netloc.replace("postgres.", "tulasi_api.")
    elif netloc.startswith("postgres:"):
        netloc = "tulasi_api" + netloc[8:]
    engine_url = parsed._replace(netloc=netloc).geturl()

print("Using TULASI_API engine URL")
engine = create_engine(engine_url)
postgres_engine = create_engine(base_url)

# Replicate the RLS application hook from database.py for our test session
@event.listens_for(SQLAlchemySession, "after_begin")
def set_rls_context(session, transaction, connection):
    user_id = session.info.get("current_user_id")
    if user_id is not None:
        connection.execute(
            text("SELECT set_config('app.current_user_id', :uid, true)"),
            {"uid": str(user_id)}
        )

def run_tests():
    # Find two distinct users using postgres engine
    with postgres_engine.begin() as conn:
        users = conn.execute(text('SELECT id FROM "user" LIMIT 2')).fetchall()
    
    if len(users) < 2:
        return {"error": "Not enough users"}
        
    userA, userB = users[0][0], users[1][0]
    
    results = {}
    
    with engine.begin() as conn:
        res = conn.execute(text("SELECT current_user, session_user, current_setting('app.current_user_id', true)")).fetchone()
        results['initial_context'] = {'current_user': res[0], 'session_user': res[1], 'app_user_id': res[2]}
        
        # Verify role attributes
        role_res = conn.execute(text("SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname = 'tulasi_api'")).fetchone()
        results['role_attributes'] = {'rolsuper': role_res[0], 'rolbypassrls': role_res[1]}
        
    # Test A: Unauthenticated
    with Session(engine) as session:
        # NO current_user_id set in session.info
        resA = session.execute(text('SELECT COUNT(*) FROM "user"')).scalar()
        results['unauthenticated_select_users'] = (resA == 0)
        
    # Test B: User A Context
    with Session(engine) as session:
        session.info["current_user_id"] = userA
        
        # Read
        resB1 = session.execute(text('SELECT id FROM "user"')).fetchall()
        results['userA_can_see_self'] = (len(resB1) == 1 and resB1[0][0] == userA)
        
        resB2 = session.execute(text("SELECT user_id FROM profile")).fetchall()
        results['userA_cannot_see_userB_profile'] = all(r[0] == userA for r in resB2)
        
        doc_res = session.execute(text("SELECT d.user_id FROM documentchunk dc JOIN document d ON dc.document_id = d.id")).fetchall()
        results['userA_docchunk_isolation'] = all(r[0] == userA for r in doc_res)
        
        # Update User B (which should fail/affect 0 rows)
        update_res = session.execute(text("UPDATE profile SET bio = 'hacked' WHERE user_id = :uid RETURNING id"), {'uid': userB}).fetchall()
        results['userA_cannot_update_userB'] = len(update_res) == 0
        
        session.rollback()
        
    # Test C: Transaction Reset / Commit
    with Session(engine) as session:
        session.info["current_user_id"] = userA
        
        res_before = session.execute(text('SELECT COUNT(*) FROM "user"')).scalar()
        session.commit()
        
        # After commit, new transaction starts automatically on next query
        res_after = session.execute(text('SELECT COUNT(*) FROM "user"')).scalar()
        results['transaction_reset_preserves_context'] = (res_before == 1 and res_after == 1)
        
    # Test D: Separate Session Isolation
    with Session(engine) as sessionA, Session(engine) as sessionB:
        sessionA.info["current_user_id"] = userA
        sessionB.info["current_user_id"] = userB
        
        resA = sessionA.execute(text('SELECT id FROM "user"')).fetchall()
        resB = sessionB.execute(text('SELECT id FROM "user"')).fetchall()
        
        results['separate_session_isolation'] = (
            len(resA) == 1 and resA[0][0] == userA and 
            len(resB) == 1 and resB[0][0] == userB
        )
    
    return results

if __name__ == '__main__':
    try:
        report = run_tests()
        print("=== RLS AUDIT REPORT ===")
        print(json.dumps(report, indent=2))
    except Exception as e:
        print("ERROR:", str(e))

import os
import json
import sys
from datetime import datetime, date
from uuid import UUID
from sqlmodel import Session, select
from pathlib import Path

# Setup path to import app correctly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import engine
from app.models.models import User, ChatMessage, ActivityLog, PersistentInterviewSession, UserFeedback, SolvedProblem, InviteCode

def backup_database():
    output_dir = Path(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))) / "database" / "backups"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = output_dir / f"tulasi_backup_{timestamp}.json"
    
    print(f"📦 Starting database backup to {backup_file}...")
    
    data = {}
    
    try:
        with Session(engine) as session:
            models = {
                "users": User,
                "chat_messages": ChatMessage,
                "activity_logs": ActivityLog,
                "interview_sessions": PersistentInterviewSession,
                "user_feedback": UserFeedback,
                "solved_problems": SolvedProblem,
                "invite_codes": InviteCode
            }
            
            for key, model in models.items():
                print(f"  → Exporting {key}...")
                records = session.exec(select(model)).all()
                data[key] = [record.model_dump() for record in records]
                
        # Handle UUIDs and Dates
        class ComplexEncoder(json.JSONEncoder):
            def default(self, obj):
                if isinstance(obj, (datetime, date)):
                    return obj.isoformat()
                if isinstance(obj, UUID):
                    return str(obj)
                return super().default(obj)
                
        with open(backup_file, "w", encoding="utf-8") as f:
            json.dump(data, f, cls=ComplexEncoder, indent=2)
            
        print(f"✅ Backup complete! Successfully exported {sum(len(v) for v in data.values())} records to '{backup_file.name}'")
        
    except Exception as e:
        print(f"❌ Backup failed: {e}")

if __name__ == "__main__":
    backup_database()

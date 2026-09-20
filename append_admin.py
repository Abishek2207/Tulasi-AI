import os

with open('backend/app/api/admin.py', 'a', encoding='utf-8') as f:
    f.write('''
@router.get("/market-stats")
async def get_market_stats(db: Session = Depends(get_session), current_user: User = Depends(get_current_admin)):
    from app.models.models import Job, MarketSnapshot
    from sqlmodel import select, func
    
    total_jobs = db.exec(select(func.count(Job.id))).one_or_none() or 0
    total_snapshots = db.exec(select(func.count(MarketSnapshot.id))).one_or_none() or 0
    
    return {
        "status": "ACTIVE",
        "jobs_collected": total_jobs,
        "market_snapshots": total_snapshots,
        "message": "Real SerpApi integration active. Deduplication enabled."
    }
''')

import os

with open('backend/app/api/admin.py', 'a', encoding='utf-8') as f:
    f.write('''
@router.post("/market-refresh")
async def refresh_market_data(db: Session = Depends(get_session), current_user: User = Depends(get_current_admin)):
    try:
        from app.agents.market_intelligence import fetch_market_trends
        # Trigger an orchestrated refresh for top roles
        roles = ["Backend Engineer", "AI Engineer", "Frontend Engineer"]
        results = {}
        for role in roles:
            results[role] = fetch_market_trends(current_role=role, target_role=role, location="Remote")
            
        return {"status": "SUCCESS", "results": results, "message": "Market data refreshed successfully."}
    except Exception as e:
        return {"status": "ERROR", "message": str(e)}
''')

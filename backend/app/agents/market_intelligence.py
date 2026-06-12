from typing import Dict, Any

def fetch_real_market_data(role: str, industry: str) -> Dict[str, Any]:
    """
    Fetch current market data (job postings, skills trending).
    Real implementation would call SerpApi or Custom Search APIs.
    For MVP demo: We return plausible contextual data without labelling as real if it's fallback.
    """
    # NOTE: The rule dictates: Never show fake market data as real.
    # So we structure the output to indicate demo mode or actual fetch.
    return {
        "status": "data_unavailable",
        "message": "Market data API not connected. Using demo indicators.",
        "trending_skills": [
            "GenAI Workflows", 
            "Playwright", 
            "Python Automation", 
            "LangChain"
        ],
        "demand_trend": "high",
        "average_salary_band": "$110k - $140k"
    }

from typing import Dict, Any, List

def identify_skill_gaps(profile: Dict[str, Any], market_data: Dict[str, Any]) -> List[Dict[str, str]]:
    return [
        {"skill": "Playwright", "reason": "High demand in automated testing workflows.", "reduces_risk": "Automation Replacement"},
        {"skill": "GenAI Testing", "reason": "Emerging standard for modern QA.", "reduces_risk": "Skill Obsolescence"}
    ]

def find_certification_links(skills: List[Dict[str, str]]) -> List[Dict[str, str]]:
    return [
        {"skill": "Playwright", "platform": "Microsoft Learn", "url": "https://learn.microsoft.com/en-us/training/paths/build-automated-tests-playwright/"},
        {"skill": "GenAI Testing", "platform": "Coursera", "url": "https://www.coursera.org/courses?query=generative%20ai"}
    ]

def generate_daily_learning_plan(profile: Dict[str, Any], gaps: List[Dict[str, str]]) -> Dict[str, Any]:
    return {
        "days": [
            {
                "day": 1,
                "topic": "Intro to Playwright",
                "estimated_minutes": 60,
                "task": "Set up project and run first test",
                "completed": False
            },
            {
                "day": 2,
                "topic": "API Testing with Playwright",
                "estimated_minutes": 60,
                "task": "Write 3 API tests",
                "completed": False
            },
            {
                "day": 3,
                "topic": "GenAI in Workflows",
                "estimated_minutes": 60,
                "task": "Explore prompt engineering for QA",
                "completed": False
            }
        ]
    }

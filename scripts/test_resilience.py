import requests
import json
import time

API_BASE = "http://127.0.0.1:10000/api"
TOKEN = "your_test_token_here" # Needs a valid token if testing locally

def test_endpoint(endpoint, method="GET", payload=None):
    url = f"{API_BASE}{endpoint}"
    headers = {"Authorization": f"Bearer {TOKEN}"}
    
    print(f"Testing {method} {url}...")
    try:
        if method == "GET":
            response = requests.get(url, headers=headers)
        else:
            response = requests.post(url, headers=headers, json=payload)
        
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("Success! (AI or Fallback returned)")
            # print(json.dumps(response.json(), indent=2)[:500] + "...")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")
    print("-" * 30)

if __name__ == "__main__":
    # Note: These will fail without a valid 
    print("RESILIENCE SMOKE TEST")
    print("Note: Ensure backend is running and TOKEN is valid.")
    
    # Career GPS
    test_endpoint("/intel/career-gps", "POST", {"year": "3rd_year", "target_role": "AI Engineer"})
    
    # Salary Intel
    test_endpoint("/intel/salary-intel", "POST", {"role": "Software Engineer", "location": "Bangalore", "yoe": 2})
    
    # Roadmaps
    test_endpoint("/roadmaps/generate", "POST", {"goal": "AI Engineer"})
    
    # Resume Builder
    test_endpoint("/resume/improve", "POST", {
        "resume_text": "Experienced software engineer with Python and React.",
        "job_description": "Looking for an AI Engineer to build LLM apps.",
        "mode": "Elite-Technical"
    })

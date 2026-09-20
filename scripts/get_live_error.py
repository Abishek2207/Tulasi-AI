import requests
import json

BASE_URL = "https://tulasi-ai-wgwl.onrender.com"

def get_error():
    print("1. Logging in...")
    login_res = requests.post(
        f"{BASE_URL}/api/auth/login",
        data={"username": "test_hackathon_e2e@example.com", "password": "password"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    if not login_res.ok:
        print(f"Login failed: {login_res.status_code} - {login_res.text}")
        return
    
    token = login_res.json()["access_token"]
    print("✅ Logged in.")
    
    print("2. Fetching hackathons...")
    res = requests.get(
        f"{BASE_URL}/api/hackathons",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    print(f"Status Code: {res.status_code}")
    try:
        data = res.json()
        print("JSON Response:")
        print(json.dumps(data, indent=2))
    except:
        print("Raw Response Content:")
        print(res.text)

if __name__ == "__main__":
    get_error()

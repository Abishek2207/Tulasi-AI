import requests
import json

# Configuration
API_URL = "http://localhost:8000" # Change to production URL if testing live
TOKEN = "YOUR_TEST_TOKEN" # Replace with a valid token from your account

def test_review_submission():
    payload = {
        "name": "Krishna",
        "role": "Student",
        "review": "Excellent Platform - Testing standardized fix",
        "rating": 5
    }
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {TOKEN}"
    }
    
    print(f"Testing POST {API_URL}/api/reviews...")
    try:
        response = requests.post(f"{API_URL}/api/reviews", headers=headers, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 201:
            print("✅ SUCCESS: Review submitted successfully!")
        else:
            print(f"❌ FAILED: Received status {response.status_code}")
            
    except Exception as e:
        print(f"❌ ERROR: {e}")

if __name__ == "__main__":
    test_review_submission()

import requests
import uuid
import time
import sys

BACKEND_URL = "http://localhost:8001"

def test_api():
    print("--- Testing Certificates via API ---")
    
    # 1. Register a user
    email = f"apitest_{uuid.uuid4().hex[:6]}@example.com"
    pwd = "testpassword123"
    print(f"\n[1] Registering user {email}...")
    res = requests.post(f"{BACKEND_URL}/api/auth/register", json={
        "email": email, "password": pwd, "name": "API Tester"
    })
    
    if res.status_code != 200:
        print("Registration failed:", res.text)
        sys.exit(1)
        
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✅ Registered successfully!")

    # 2. Try to generate YouTube certificate (0 watched)
    print("\n[2] Attempting to generate YouTube Pro certificate with 0 videos watched...")
    res = requests.post(f"{BACKEND_URL}/api/certificates/generate/video_learner", headers=headers)
    print("Status:", res.status_code)
    
    if res.status_code == 403:
        print("✅ Correctly rejected generation at 0% progress!")
    else:
        print("❌ Failed: Should have rejected with 403, got", res.status_code, res.text)
        sys.exit(1)
        
    # 3. Watch 50 videos via API to reach 100%
    print("\n[3] Simulating watching 50 videos to achieve 100% progress... Please wait.")
    for i in range(1, 51):
        res = requests.post(
            f"{BACKEND_URL}/api/activity/log",
            headers=headers,
            json={"action_type": "video_watched", "title": f"Test Video {i}"}
        )
        if res.status_code != 200:
            print(f"Failed to log video {i}:", res.text)
            sys.exit(1)
            
    print("✅ Successfully logged 50 videos!")

    # Verify progress
    res = requests.get(f"{BACKEND_URL}/api/certificates/my", headers=headers)
    prog = res.json().get("progress", [])
    video_prog = next((p for p in prog if p["category"] == "videos"), None)
    print(f"Current Video Progress state in DB: {video_prog}")

    # 4. Generate Certificate again
    print("\n[4] Attempting to generate YouTube Pro certificate with 100% progress...")
    res = requests.post(f"{BACKEND_URL}/api/certificates/generate/video_learner", headers=headers)
    print("Status:", res.status_code)
    
    if res.status_code == 200:
        print("✅ SUCCESS! Certificate generated properly:")
        print("Data:", res.json())
    else:
        print("❌ Failed: Should have succeeded, got", res.status_code, res.text)
        sys.exit(1)
        
if __name__ == "__main__":
    test_api()

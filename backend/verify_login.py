import requests
import time
import sys

BASE_URL = "http://127.0.0.1:10000/api"
TEST_USER = {
    "email": "test_verification@tulasiai.com",
    "password": "VerificationPassword123!",
    "name": "Verification Bot"
}

def verify():
    print("🚀 Starting Local API Verification...")
    
    # 1. Health Check
    try:
        res = requests.get(f"{BASE_URL}/health")
        print(f"Health Check: {res.status_code} - {res.json()}")
    except Exception as e:
        print(f"❌ Backend not reachable: {e}")
        sys.exit(1)

    # 2. Register Test User (Cleanup if exists is handled by 400 check)
    print("\nAttempting Registration...")
    res = requests.post(f"{BASE_URL}/auth/register", json=TEST_USER)
    if res.status_code == 200:
        print("✅ Registration Success")
    elif res.status_code == 400:
        print("ℹ️ User already exists, proceeding to login check.")
    else:
        print(f"❌ Registration Failed: {res.status_code} - {res.text}")

    # 3. Valid Login
    print("\nAttempting Valid Login...")
    res = requests.post(f"{BASE_URL}/auth/login", json={
        "email": TEST_USER["email"],
        "password": TEST_USER["password"]
    })
    if res.status_code == 200:
        print(f"✅ Login Success: {res.json().get('access_token')[:20]}...")
    else:
        print(f"❌ Login Failed: {res.status_code} - {res.text}")

    # 4. Invalid Login (Wrong Password)
    print("\nAttempting Invalid Login (Wrong Password)...")
    res = requests.post(f"{BASE_URL}/auth/login", json={
        "email": TEST_USER["email"],
        "password": "wrong_password"
    })
    if res.status_code == 401:
        print("✅ Handled correctly: 401 Unauthorized")
    else:
        print(f"❌ Invalid Login failed to return 401: {res.status_code}")

    # 5. Missing Fields (Harden check)
    print("\nAttempting Malformed Login (Missing Password)...")
    res = requests.post(f"{BASE_URL}/auth/login", json={"email": TEST_USER["email"]})
    if res.status_code == 400:
         print("✅ Handled correctly: 400 Bad Request")
    else:
         print(f"❌ Malformed login failed to return 400: {res.status_code}")

if __name__ == "__main__":
    verify()

import requests

BASE_URL = "https://tulasi-ai-wgwl.onrender.com"

def get_error():
    print("Fetching login error...")
    res = requests.post(
        f"{BASE_URL}/api/auth/login",
        data={"username": "test_hackathon_e2e@example.com", "password": "password"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    print(f"Status: {res.status_code}")
    print("Body:")
    print(res.text)

if __name__ == "__main__":
    get_error()

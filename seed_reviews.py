"""
Seed reviews to production using the admin /reviews/seed endpoint.
Usage: python seed_reviews.py <admin_password>
"""
import sys
import requests

PROD = "https://tulasi-ai-wgwl.onrender.com"
ADMIN_EMAIL = "abishekramamoorthy22@gmail.com"

if len(sys.argv) < 2:
    print("Usage: python seed_reviews.py <your_admin_password>")
    sys.exit(1)

password = sys.argv[1]

REVIEWS = [
    {"name": "Gurucharan", "review": "GOOD NOT BAD", "rating": 5},
    {"name": "KRISHNA", "role": "STUDENT", "review": "Really amazing....!!!!", "rating": 5},
    {"name": "Aadhi", "role": "PAAVAI", "review": "It is incredibly easy for beginners to learn, yet powerful enough to handle the complex needs of advanced users", "rating": 5},
    {"name": "Bharat", "role": "Student@Paavai", "review": "All in one AI excellent for beginners", "rating": 5},
    {"name": "Yogeshwaran", "role": "Student@Paavai", "review": "Good features", "rating": 5},
    {"name": "Santhosh", "role": "Designer@Airbus", "review": "Tulsi AI is an outstanding platform that perfectly balances simplicity and power. Its intuitive design makes it incredibly accessible for beginners, while its robust features provide all the depth that advanced users need. Highly recommended", "rating": 5},
    {"name": "Krishna", "review": "Excellent Platform", "rating": 5},
    {"name": "Abdul", "role": "student", "review": "this AI will beat the open AI", "rating": 5},
    {"name": "Hami", "review": "Really, It is amazing to use this website!", "rating": 5},
    {"name": "Abhimanyu S S", "role": "Student@PEC", "review": "Excellent platform for Students", "rating": 5},
]

print(f"Logging in as {ADMIN_EMAIL}...")
login_resp = requests.post(f"{PROD}/api/auth/login",
    json={"email": ADMIN_EMAIL, "password": password}, timeout=60)

if login_resp.status_code != 200:
    print(f"Login failed ({login_resp.status_code}): {login_resp.text[:200]}")
    sys.exit(1)

token = login_resp.json()["access_token"]
print(f"Logged in! Token: {token[:20]}...")

print(f"\nSeeding {len(REVIEWS)} reviews via /api/reviews/seed...")
resp = requests.post(f"{PROD}/api/reviews/seed",
    json=REVIEWS,
    headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
    timeout=60)

if resp.status_code in (200, 201):
    data = resp.json()
    print(f"SUCCESS! Inserted {data.get('inserted', '?')} reviews to production.")
else:
    print(f"FAILED ({resp.status_code}): {resp.text[:300]}")

import requests

PROD = "https://tulasi-ai-wgwl.onrender.com"
SEED_SECRET = "tulasi-seed-2026"

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

def seed():
    print(f"Seeding {len(REVIEWS)} reviews to {PROD}/api/reviews/seed-public...")
    try:
        resp = requests.post(
            f"{PROD}/api/reviews/seed-public",
            json=REVIEWS,
            headers={"X-Seed-Secret": SEED_SECRET, "Content-Type": "application/json"},
            timeout=30
        )
        print("Status:", resp.status_code)
        print("Response:", resp.text)
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    seed()

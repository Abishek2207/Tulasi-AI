import urllib.request
import json
import time

REAL_REVIEWS = [
    {"name": "Gurucharan", "role": None, "review": "GOOD NOT BAD", "rating": 5},
    {"name": "KRISHNA", "role": "STUDENT", "review": "Really amazing....!!!!", "rating": 5},
    {"name": "Aadhi", "role": "PAAVAI", "review": "It is incredibly easy for beginners to learn, yet powerful enough to handle the complex needs of advanced users", "rating": 5},
    {"name": "Bharat", "role": "Student@Paavai", "review": "All in one AI excellent for beginners", "rating": 5},
    {"name": "Yogeshwaran", "role": "Student@Paavai", "review": "Good features \u2764\ufe0f\U0001f525", "rating": 5},
    {"name": "Santhosh", "role": "Designer@Airbus", "review": "Tulsi AI is an outstanding platform that perfectly balances simplicity and power. Its intuitive design makes it incredibly accessible for beginners, while its robust features provide all the depth that advanced users need. Highly recommended", "rating": 5},
    {"name": "Krishna", "role": None, "review": "Excellent Platform", "rating": 5},
    {"name": "Abdul", "role": "student", "review": "this AI will beat the open AI", "rating": 5},
    {"name": "Hami", "role": None, "review": "Really, It's amazing to use this website\U0001f44c!!!", "rating": 5},
    {"name": "Abhimanyu S S", "role": "Student@PEC", "review": "Excellent platform for Students\U0001f525\U0001f525", "rating": 5},
]

url = 'https://tulasi-ai-wgwl.onrender.com/api/reviews'

print("Seeding real reviews...")
success_count = 0
for r in REAL_REVIEWS:
    data = json.dumps(r).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'}, method='POST')
    try:
        urllib.request.urlopen(req)
        print("Success:", r['name'])
        success_count += 1
    except Exception as e:
        print("Error with", r['name'], "-", e)
    time.sleep(0.5)

print(f"Finished seeding {success_count}/{len(REAL_REVIEWS)} reviews.")

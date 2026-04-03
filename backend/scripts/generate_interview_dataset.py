import sys
import os
import json
import time

# Ensure we can import from app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.ai_router import get_ai_response

DATA_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'rag_interview.json')

def generate_dataset():
    themes = [
        "React and Frontend Architecture",
        "Backend Database Scaling and SQL Performance",
        "Python and Data Science Data Manipulation",
        "System Design and High Availability Architecture",
        "DevOps CI/CD and Containerization",
        "Behavioral: Leadership, Teamwork, and Conflict",
        "General Data Structures and Algorithms",
        "Machine Learning Model Training and Evaluation",
        "Cybersecurity Fundamentals and Vulnerability patching",
        "Cloud Engineering AWS/Azure/GCP essentials"
    ]

    all_data = []
    
    print("Starting generation of 50 interview examples...")

    # We generate 5 questions per theme = 50 total
    for theme in themes:
        prompt = f"""Generate EXACTLY 5 diverse interview questions for the theme: "{theme}".
Respond purely in JSON format as a list of objects. DO NOT use markdown code blocks.
Each object must have these exactly 4 keys:
"question": The interview question string.
"ideal_answer": A high-quality, structured, comprehensive answer (3-5 sentences).
"poor_answer": A low-quality, brief, generic, or incorrect answer.
"keywords": A list of 4-6 essential technical or conceptual keywords that should be present in a great answer.
"""
        print(f"Generating for theme: {theme}...")
        try:
            response = get_ai_response(prompt, force_model="gemini-2.5-flash")
            import re
            # Extract JSON array
            match = re.search(r'\[.*\]', response, re.DOTALL)
            if match:
                items = json.loads(match.group())
            else:
                items = json.loads(response)
            
            for item in items:
                # Format check
                if "question" in item and "ideal_answer" in item:
                    all_data.append(item)
                    
            print(f"✅ Success. Total collected: {len(all_data)}")
        except Exception as e:
            print(f"❌ Failed to generate for {theme}: {e}")
            
        time.sleep(2) # rate limit protection
    
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(all_data, f, indent=2)
    print(f"\n🎉 Saved {len(all_data)} questions to {DATA_FILE}")

if __name__ == "__main__":
    generate_dataset()

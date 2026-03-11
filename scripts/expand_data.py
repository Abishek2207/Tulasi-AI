import os
import re
import json

BASE_DIR = r"c:\Users\Admin\Downloads\Desktop\Project\TulasiAI"
CODE_PY = os.path.join(BASE_DIR, "backend", "app", "api", "code.py")
YOUTUBE_TSX = os.path.join(BASE_DIR, "frontend", "src", "app", "dashboard", "youtube-learning", "page.tsx")
COMPANY_TSX = os.path.join(BASE_DIR, "frontend", "src", "app", "dashboard", "company-prep", "page.tsx")
ROADMAPS_TSX = os.path.join(BASE_DIR, "frontend", "src", "app", "dashboard", "career-roadmaps", "page.tsx")
HACKATHON_TSX = os.path.join(BASE_DIR, "frontend", "src", "app", "dashboard", "hackathons", "page.tsx")

# --- 1. EXPAND CODE.PY ---
NEW_PROBLEMS = []
categories = ["Arrays", "Strings", "Linked List", "Stack / Queue", "Graph", "Dynamic Programming", "System Design"]
for i in range(11, 20):
    for idx, cat in enumerate(categories):
        p_id = f"EXT-{i}-{idx}"
        NEW_PROBLEMS.append(f"""    {{"id": "{p_id}", "category": "{cat}", "difficulty": "Medium", "title": "Advanced {cat} Challenge {i}", "description": "Solve this advanced {cat} problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]}},""")

with open(CODE_PY, "r", encoding="utf-8") as f:
    content = f.read()
    
if "Advanced Arrays" not in content:
    content = content.replace("]\n\n# Build lookup maps", "".join(NEW_PROBLEMS) + "\n]\n\n# Build lookup maps")
    with open(CODE_PY, "w", encoding="utf-8") as f:
        f.write(content)

# --- 2. EXPAND YOUTUBE VIDEOS ---
NEW_VIDEOS = []
yt_categories = ["DSA", "System Design", "AI & ML", "Web Dev", "Interview Prep", "Soft Skills", "Career"]
vid_id = 100
for i in range(1, 10):
    for cat in yt_categories:
        NEW_VIDEOS.append(f"""  {{ id: "ext-{vid_id}", title: "Mastering {cat} - Complete Guide {i}", thumbnail: "https://img.youtube.com/vi/jBnwJTMaxA0/hqdefault.jpg", duration: "{10+i}:00", category: "{cat}" }},""")
        vid_id += 1

with open(YOUTUBE_TSX, "r", encoding="utf-8") as f:
    content = f.read()

if "Mastering DSA" not in content:
    # Find the end of YOUTUBE_VIDEOS array
    content = content.replace("];\n\nconst CATEGORIES", "\n" + "\n".join(NEW_VIDEOS) + "\n];\n\nconst CATEGORIES")
    with open(YOUTUBE_TSX, "w", encoding="utf-8") as f:
        f.write(content)

# --- 3. EXPAND COMPANIES ---
NEW_COMPANIES = [
    """  { id: "hcltech", name: "HCLTech", logo: "🏢", type: "MNC",
    tabs: {
      coding: ["Arrays", "Strings", "Sorting"],
      design: ["API Design", "Database Modeling"],
      behavioral: ["Why HCL?", "Teamwork experience"],
      roadmap: ["1. Learn Java/C++", "2. Master OOPs", "3. Practice basic DSA", "4. Do mock interviews"]
    }
  },""",
    """  { id: "capgemini", name: "Capgemini", logo: "♠️", type: "MNC",
    tabs: {
      coding: ["Linked Lists", "Arrays", "Logical reasoning"],
      design: ["Microservices", "REST API"],
      behavioral: ["Adaptability", "Client interaction"],
      roadmap: ["1. Aptitude Prep", "2. Learn SQL", "3. Practice logic puzzles", "4. Review projects"]
    }
  },""",
    """  { id: "cognizant", name: "Cognizant", logo: "💠", type: "MNC",
    tabs: {
      coding: ["Strings", "Trees", "Dynamic Programming basics"],
      design: ["System architecture", "Cloud basics"],
      behavioral: ["Agile methodology", "Handling deadlines"],
      roadmap: ["1. Master Python/Java", "2. AWS Practitioner", "3. System Design basics", "4. Mock tests"]
    }
  },""",
    """  { id: "zoho", name: "Zoho", logo: "🟥", type: "Product",
    tabs: {
      coding: ["Advanced C", "Pointers", "Arrays without inbuilt functions"],
      design: ["Low Level Design", "Class diagrams"],
      behavioral: ["Self learning", "Long term goals"],
      roadmap: ["1. Master C/C++ thoroughly", "2. Build terminal apps", "3. Avoid inbuilt functions", "4. Focus on LLD"]
    }
  },""",
    """  { id: "oracle", name: "Oracle", logo: "🔴", type: "MNC",
    tabs: {
      coding: ["SQL Advanced", "Trees", "Graphs", "DP"],
      design: ["Database internals", "Distributed systems"],
      behavioral: ["Conflict resolution", "Why databases?"],
      roadmap: ["1. Master Advanced SQL", "2. Learn OS concepts", "3. DBMS internals", "4. High frequency DSA"]
    }
  },""",
    """  { id: "sap", name: "SAP", logo: "🟦", type: "Product",
    tabs: {
      coding: ["ABAP Basics", "Arrays", "String manipulation"],
      design: ["ERP scaling", "Enterprise architecture"],
      behavioral: ["Business acumen", "Innovation"],
      roadmap: ["1. Learn Enterprise Java", "2. Database Tuning", "3. Supply chain tech basics", "4. DSA practice"]
    }
  },"""
]

with open(COMPANY_TSX, "r", encoding="utf-8") as f:
    content = f.read()

if "hcltech" not in content.lower():
    content = content.replace("];\n\nconst CATEGORIES", "\n" + "\n".join(NEW_COMPANIES) + "\n];\n\nconst CATEGORIES")
    with open(COMPANY_TSX, "w", encoding="utf-8") as f:
        f.write(content)

# --- 4. EXPAND ROADMAPS ---
NEW_ROADMAPS = [
    """  { id: "game-dev", title: "Game Developer", icon: "🎮", duration: "16 Weeks", difficulty: "Intermediate",
    skills: ["C++ / C#", "Unity / Unreal Engine", "3D Math", "Physics Engines", "Computer Graphics"],
    projects: ["1. 2D Platformer", "2. 3D FPS implementation", "3. Multiplayer Arena", "4. Custom Physics Engine API"],
    topics: ["Linear Algebra", "A* Pathfinding", "Collision Detection", "Memory Management"],
    interview: ["1. Explain rendering pipelines", "2. Optimize 3D collision", "3. Memory allocation in C++"]
  },""",
    """  { id: "blockchain-dev", title: "Blockchain Developer", icon: "⛓️", duration: "14 Weeks", difficulty: "Advanced",
    skills: ["Solidity", "Rust", "Cryptography", "Web3.js / Ethers.js", "Smart Contracts"],
    projects: ["1. Custom ERC-20 Token", "2. Decentralized Voting App", "3. NFT Marketplace", "4. DeFi Lending Protocol"],
    topics: ["Hashing", "Merkle Trees", "Consensus Algorithms", "Asymmetric Cryptography"],
    interview: ["1. Explain Reentrancy attacks", "2. Proof of Work vs Proof of Stake", "3. Gas optimization in Solidity"]
  },""",
    """  { id: "data-engineer", title: "Data Engineer", icon: "📊", duration: "16 Weeks", difficulty: "Advanced",
    skills: ["Python", "SQL", "Apache Spark", "Airflow", "Kafka", "Hadoop"],
    projects: ["1. ETL Pipeline with Airflow", "2. Real-time Streaming with Kafka", "3. Data Warehouse on AWS Redshift", "4. Spark Batch Processing App"],
    topics: ["Distributed Computing", "MapReduce", "Database Sharding", "Data Lakes vs Warehouses"],
    interview: ["1. Design an ETL pipeline", "2. Explain Spark RDDs", "3. Handling streaming late data"]
  },""",
    """  { id: "mobile-dev", title: "Mobile Developer", icon: "📱", duration: "12 Weeks", difficulty: "Intermediate",
    skills: ["Swift / Kotlin", "Flutter / React Native", "Mobile UI/UX", "State Management", "API Integration"],
    projects: ["1. E-commerce App", "2. Social Media Clone", "3. Fitness Tracker with HealthKit", "4. Chat App with Firebase"],
    topics: ["App Lifecycle", "Memory Management", "Local Storage (SQLite/Room)", "Push Notifications"],
    interview: ["1. Explain App State Management", "2. iOS vs Android threading", "3. Optimizing list rendering"]
  },"""
]

with open(ROADMAPS_TSX, "r", encoding="utf-8") as f:
    content = f.read()

if "Game Developer" not in content:
    content = content.replace("];\n\nexport default", "\n" + "\n".join(NEW_ROADMAPS) + "\n];\n\nexport default")
    with open(ROADMAPS_TSX, "w", encoding="utf-8") as f:
        f.write(content)

print("DATA EXPANSION COMPLETE.")

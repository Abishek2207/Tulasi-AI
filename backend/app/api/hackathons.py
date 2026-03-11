from fastapi import APIRouter
from typing import List

router = APIRouter()

HACKATHONS = [
    {"id": 1, "name": "Google Summer of Code 2026", "organizer": "Google", "description": "Global flagship open-source program. Mentorship, stipend, and massive learning opportunities by contributing to real-world projects.", "prize": "$1500 - $3300 Stipend", "deadline": "March 20, 2026", "link": "https://summerofcode.withgoogle.com", "tags": "open-source, competitive, global"},
    {"id": 2, "name": "Smart India Hackathon (SIH) 2026", "organizer": "Govt of India", "description": "World's biggest open innovation model. Solve real-world problem statements submitted by ministries and top industries in India.", "prize": "₹1,00,000", "deadline": "April 15, 2026", "link": "https://sih.gov.in", "tags": "india, social-good, competitive"},
    {"id": 3, "name": "MLH Global Hack Week", "organizer": "Major League Hacking", "description": "A week-long beginner-friendly digital festival of learning, building, and sharing projects. Great for first-time hackers.", "prize": "Swag & Cloud Credits", "deadline": "Every Month", "link": "https://ghw.mlh.io", "tags": "beginner-friendly, global, all"},
    {"id": 4, "name": "EthGlobal Web3 Hackathon", "organizer": "EthGlobal", "description": "Build the decentralized future. Dive deep into smart contracts, DeFi, and DApps on the Ethereum ecosystem.", "prize": "$50,000 Pool", "deadline": "May 05, 2026", "link": "https://ethglobal.com", "tags": "web3, competitive, global"},
    {"id": 5, "name": "NASA Space Apps Challenge", "organizer": "NASA", "description": "Global hackathon utilizing NASA's open data to build solutions addressing challenges on Earth and in space.", "prize": "Global Recognition", "deadline": "October 02, 2026", "link": "https://spaceappschallenge.org", "tags": "space, open-source, global"},
    {"id": 6, "name": "HackMIT 2026", "organizer": "MIT", "description": "MIT's premier fall hackathon. Build innovative software and hardware projects over a weekend of intense coding and collaboration.", "prize": "$10,000+ Prizes", "deadline": "July 30, 2026", "link": "https://hackmit.org", "tags": "competitive, collegiate"},
    {"id": 7, "name": "Meta XR Hackathon", "organizer": "Meta Platforms", "description": "Create the next generation of augmented and virtual reality experiences using Meta Quest and Spark AR tools.", "prize": "$25,000 Pool", "deadline": "August 12, 2026", "link": "https://meta.com/hackathons", "tags": "ar-vr, competitive"},
    {"id": 8, "name": "Claude AI App Challenge", "organizer": "Anthropic", "description": "Build innovative, helpful, and honest AI applications using the Claude 3.5 API. Focus on real-world utility.", "prize": "$15,000 & API Credits", "deadline": "June 10, 2026", "link": "https://anthropic.com", "tags": "ai, competitive"},
    {"id": 9, "name": "Vercel AI Hackathon", "organizer": "Vercel", "description": "Build the fastest and most highly-responsive AI web applications using Next.js and Vercel AI SDK.", "prize": "$5,000 + Pro Plans", "deadline": "April 30, 2026", "link": "https://vercel.com/ai", "tags": "ai, frontend, web"},
    {"id": 10, "name": "OpenAI Developer Challenge", "organizer": "OpenAI", "description": "Push the boundaries of what is possible with GPT-4 and Whisper APIs by building transformative AI tools.", "prize": "$50,000 API Credits", "deadline": "August 01, 2026", "link": "https://openai.com", "tags": "ai, global"},
    {"id": 11, "name": "Hugging Face Open AI Hack", "organizer": "Hugging Face", "description": "Contribute to open-source AI models, spaces, and datasets. Build community-driven ML solutions.", "prize": "Community Recognition", "deadline": "Ongoing", "link": "https://huggingface.co", "tags": "ai, open-source"},
    {"id": 12, "name": "Devfolio Ethereum India", "organizer": "Devfolio", "description": "India's largest Web3 hackathon. Build DApps, DAOs, and DeFi protocols specifically targeting the Indian ecosystem.", "prize": "₹5,00,000 Pool", "deadline": "September 15, 2026", "link": "https://ethindia.co", "tags": "web3, india"},
    {"id": 13, "name": "Stripe Payments Hackathon", "organizer": "Stripe", "description": "Innovate the future of online commerce by building seamless payment infrastructure and monetization tools using Stripe.", "prize": "$10,000 Pool", "deadline": "July 20, 2026", "link": "https://stripe.com", "tags": "fintech, web"},
    {"id": 14, "name": "Green Tech ClimateHack", "organizer": "Climate Collective", "description": "Build software solutions to combat climate change, track carbon footprints, or optimize renewable energy grids.", "prize": "$5,000", "deadline": "November 01, 2026", "link": "https://climatehack.org", "tags": "social-good, global"},
    {"id": 15, "name": "Kaggle Data Science Bowl", "organizer": "Kaggle", "description": "Tackle the most complex data science and machine learning problems alongside the smartest data scientists in the world.", "prize": "$100,000 Pool", "deadline": "December 15, 2026", "link": "https://kaggle.com", "tags": "ai, data-science, competitive"},
    {"id": 16, "name": "Supabase Launch Week Hack", "organizer": "Supabase", "description": "Build complete, scalable open-source backend applications using Supabase PostgreSQL, Edge Functions, and Auth.", "prize": "Exclusive Swag", "deadline": "Quarterly", "link": "https://supabase.com", "tags": "backend, open-source"},
    {"id": 17, "name": "Polygon BuildIt Hackathon", "organizer": "Polygon", "description": "Deploy highly scalable dApps on the Polygon network with zero gas fees. Perfect for Web3 developers.", "prize": "$20,000 Pool", "deadline": "October 20, 2026", "link": "https://polygon.technology", "tags": "web3, competitive"},
    {"id": 18, "name": "Healthcare AI Innovation", "organizer": "Mayo Clinic", "description": "Design secure and compliant AI applications that improve patient diagnosis, care delivery, and medical research.", "prize": "$15,000", "deadline": "July 05, 2026", "link": "https://healthai.org", "tags": "ai, healthcare, social-good"},
    {"id": 19, "name": "Roblox Studio Creator Challenge", "organizer": "Roblox", "description": "Design engaging 3D multiplayer experiences and games using Roblox Studio and Lua scripting.", "prize": "$5,000 (+ Robux)", "deadline": "June 25, 2026", "link": "https://roblox.com/create", "tags": "gaming, beginner-friendly"},
    {"id": 20, "name": "Docker Container Hack", "organizer": "Docker", "description": "Build tools that improve the developer experience and containerize complex distributed systems efficiently.", "prize": "$8,000 Pool", "deadline": "September 10, 2026", "link": "https://docker.com", "tags": "devops, global"}
]

from typing import List, Optional

@router.get("")
def get_hackathons(tag: Optional[str] = None):
    if tag and tag.lower() != "all":
        filtered = [h for h in HACKATHONS if tag.lower() in str(h.get("tags", "")).lower()]
        return {"hackathons": filtered, "total": len(filtered)}
    return {"hackathons": HACKATHONS, "total": len(HACKATHONS)}


@router.get("/{hackathon_id}")
def get_hackathon(hackathon_id: int):
    h = next((h for h in HACKATHONS if h["id"] == hackathon_id), None)
    if not h:
        return {"error": "Not found"}
    return h

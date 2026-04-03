"""
Feature #7 — Internship Discovery System
Serves a curated dataset of real internships with filter support.
Dataset is seeded once into the DB on startup via main.py migration.
"""
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select
from typing import Optional

from app.api.deps import get_current_user
from app.core.database import get_session
from app.models.models import User, Internship

router = APIRouter()

# ── Curated Static Internship Dataset (seeded once) ─────────────────────────
INTERNSHIP_SEED_DATA = [
    {"title": "AI/ML Research Intern", "company": "Google", "domain": "AI", "type": "Paid", "mode": "Online", "stipend": "₹80,000/month", "duration": "3 months", "description": "Work on cutting-edge ML research with Google Brain team. Requires Python, TensorFlow, and ML fundamentals.", "apply_link": "https://careers.google.com/jobs/results/?q=intern", "deadline": "2025-05-31"},
    {"title": "Data Science Intern", "company": "Microsoft", "domain": "Data Science", "type": "Paid", "mode": "Hybrid", "location": "Hyderabad", "stipend": "₹60,000/month", "duration": "6 months", "description": "Join the Azure Data team and build real-time analytics pipelines.", "apply_link": "https://careers.microsoft.com/", "deadline": "2025-06-15"},
    {"title": "Full Stack Developer Intern", "company": "Razorpay", "domain": "Web Dev", "type": "Paid", "mode": "Offline", "location": "Bangalore", "stipend": "₹50,000/month", "duration": "3 months", "description": "Build payment infrastructure features with React and Node.js.", "apply_link": "https://razorpay.com/jobs/", "deadline": "2025-05-20"},
    {"title": "DevOps Engineering Intern", "company": "Atlassian", "domain": "DevOps", "type": "Paid", "mode": "Online", "stipend": "₹55,000/month", "duration": "3 months", "description": "Work on CI/CD pipelines, Kubernetes, and cloud infrastructure.", "apply_link": "https://www.atlassian.com/company/careers", "deadline": "2025-06-01"},
    {"title": "NLP Research Intern", "company": "Hugging Face", "domain": "AI", "type": "Paid", "mode": "Online", "stipend": "$2,000/month", "duration": "3 months", "description": "Contribute to open-source NLP models and transformers.", "apply_link": "https://huggingface.co/jobs", "deadline": "2025-07-01"},
    {"title": "Android Development Intern", "company": "Flipkart", "domain": "Mobile Dev", "type": "Paid", "mode": "Offline", "location": "Bangalore", "stipend": "₹40,000/month", "duration": "2 months", "description": "Build mobile features for India's largest e-commerce platform.", "apply_link": "https://www.flipkartcareers.com/", "deadline": "2025-05-15"},
    {"title": "Cybersecurity Intern", "company": "Palo Alto Networks", "domain": "Cybersecurity", "type": "Paid", "mode": "Hybrid", "location": "Pune", "stipend": "₹45,000/month", "duration": "3 months", "description": "Analyse network vulnerabilities and work with SIEM tools.", "apply_link": "https://jobs.paloaltonetworks.com/", "deadline": "2025-06-30"},
    {"title": "Cloud Engineering Intern", "company": "Amazon AWS", "domain": "Cloud", "type": "Paid", "mode": "Online", "stipend": "$3,500/month", "duration": "3 months", "description": "Work with AWS services: Lambda, EC2, S3, RDS to build scalable solutions.", "apply_link": "https://amazon.jobs/", "deadline": "2025-08-01"},
    {"title": "Backend Engineering Intern", "company": "Zomato", "domain": "Web Dev", "type": "Paid", "mode": "Offline", "location": "Gurgaon", "stipend": "₹35,000/month", "duration": "3 months", "description": "Build scalable microservices with Go and PostgreSQL.", "apply_link": "https://www.zomato.com/careers", "deadline": "2025-05-25"},
    {"title": "Data Analytics Intern", "company": "Deloitte", "domain": "Data Science", "type": "Paid", "mode": "Hybrid", "location": "Mumbai", "stipend": "₹30,000/month", "duration": "6 months", "description": "Analyse large datasets and build business intelligence dashboards.", "apply_link": "https://www2.deloitte.com/global/en/careers.html", "deadline": "2025-06-20"},
    {"title": "UI/UX Design Intern", "company": "Swiggy", "domain": "Design", "type": "Paid", "mode": "Offline", "location": "Bangalore", "stipend": "₹30,000/month", "duration": "3 months", "description": "Design user-facing features for mobile and web applications.", "apply_link": "https://careers.swiggy.com/", "deadline": "2025-05-30"},
    {"title": "Blockchain Developer Intern", "company": "Polygon", "domain": "Blockchain", "type": "Paid", "mode": "Online", "stipend": "$1,500/month", "duration": "3 months", "description": "Build smart contracts and Web3 integrations on Ethereum L2.", "apply_link": "https://polygon.technology/careers", "deadline": "2025-07-15"},
    {"title": "Machine Learning Intern", "company": "NVIDIA", "domain": "AI", "type": "Paid", "mode": "Hybrid", "location": "Pune", "stipend": "₹70,000/month", "duration": "3 months", "description": "Work on GPU acceleration for deep learning training pipelines.", "apply_link": "https://nvidia.wd5.myworkdayjobs.com/", "deadline": "2025-06-30"},
    {"title": "Open Source Contributor (GSoC)", "company": "Google Summer of Code", "domain": "Open Source", "type": "Paid", "mode": "Online", "stipend": "$3,000 total", "duration": "3 months", "description": "Contribute to open-source organisations under Google's mentorship.", "apply_link": "https://summerofcode.withgoogle.com/", "deadline": "2025-04-02"},
    {"title": "Research Intern — NLP", "company": "IIT Madras", "domain": "AI", "type": "Unpaid", "mode": "Offline", "location": "Chennai", "stipend": "Certificate Only", "duration": "2 months", "description": "Assist in NLP research projects with publication opportunities.", "apply_link": "https://www.iitm.ac.in/", "deadline": "2025-05-10"},
    {"title": "Frontend Developer Intern", "company": "Freshworks", "domain": "Web Dev", "type": "Paid", "mode": "Hybrid", "location": "Chennai", "stipend": "₹25,000/month", "duration": "3 months", "description": "Build React components for CRM and customer support products.", "apply_link": "https://careers.freshworks.com/", "deadline": "2025-06-01"},
    {"title": "Data Engineering Intern", "company": "PhonePe", "domain": "Data Science", "type": "Paid", "mode": "Offline", "location": "Bangalore", "stipend": "₹40,000/month", "duration": "3 months", "description": "Design and maintain large-scale Spark data pipelines.", "apply_link": "https://careers.phonepe.com/", "deadline": "2025-05-20"},
    {"title": "Robotics & AI Intern", "company": "Boston Dynamics", "domain": "AI", "type": "Paid", "mode": "Offline", "location": "US (Remote OK)", "stipend": "$4,000/month", "duration": "3 months", "description": "Develop motion planning and perception systems for robots.", "apply_link": "https://www.bostondynamics.com/careers", "deadline": "2025-06-15"},
    {"title": "Product Management Intern", "company": "Meesho", "domain": "Product", "type": "Paid", "mode": "Offline", "location": "Bangalore", "stipend": "₹35,000/month", "duration": "2 months", "description": "Define product features, run A/B tests, and work with engineering teams.", "apply_link": "https://jobs.lever.co/meesho", "deadline": "2025-05-28"},
    {"title": "Embedded Systems Intern", "company": "Texas Instruments", "domain": "Hardware", "type": "Paid", "mode": "Offline", "location": "Bangalore", "stipend": "₹30,000/month", "duration": "6 months", "description": "Write firmware for microcontrollers and real-time operating systems.", "apply_link": "https://careers.ti.com/", "deadline": "2025-04-30"},
    {"title": "Generative AI Intern", "company": "Anthropic", "domain": "AI", "type": "Paid", "mode": "Online", "stipend": "$5,000/month", "duration": "3 months", "description": "Research and improve large language model safety and alignment.", "apply_link": "https://www.anthropic.com/careers", "deadline": "2025-07-01"},
    {"title": "iOS Developer Intern", "company": "CRED", "domain": "Mobile Dev", "type": "Paid", "mode": "Offline", "location": "Bangalore", "stipend": "₹35,000/month", "duration": "3 months", "description": "Build Swift/SwiftUI features for the CRED fintech app.", "apply_link": "https://careers.cred.club/", "deadline": "2025-05-31"},
    {"title": "QA Automation Intern", "company": "Infosys", "domain": "QA", "type": "Paid", "mode": "Hybrid", "location": "Mysore", "stipend": "₹15,000/month", "duration": "6 months", "description": "Write Selenium and Cypress test suites for enterprise applications.", "apply_link": "https://careers.infosys.com/", "deadline": "2025-04-25"},
    {"title": "Site Reliability Engineer Intern", "company": "Netflix", "domain": "DevOps", "type": "Paid", "mode": "Online", "stipend": "$5,500/month", "duration": "3 months", "description": "Ensure high availability and performance for streaming infrastructure.", "apply_link": "https://jobs.netflix.com/", "deadline": "2025-06-01"},
    {"title": "AR/VR Developer Intern", "company": "Meta (Reality Labs)", "domain": "AR/VR", "type": "Paid", "mode": "Hybrid", "location": "US", "stipend": "$6,000/month", "duration": "3 months", "description": "Build immersive AR/VR experiences for Quest and Ray-Ban Stories.", "apply_link": "https://www.metacareers.com/", "deadline": "2025-06-30"},
    {"title": "Technical Writer Intern", "company": "HashiCorp", "domain": "Documentation", "type": "Paid", "mode": "Online", "stipend": "$2,500/month", "duration": "3 months", "description": "Write developer documentation for Terraform, Vault, and Consul.", "apply_link": "https://www.hashicorp.com/jobs", "deadline": "2025-06-15"},
    {"title": "Computer Vision Intern", "company": "Samsung R&D", "domain": "AI", "type": "Paid", "mode": "Offline", "location": "Bangalore", "stipend": "₹50,000/month", "duration": "6 months", "description": "Develop image recognition and video analytics pipelines.", "apply_link": "https://samsung.com/global/business/samsung-rnd/", "deadline": "2025-05-31"},
    {"title": "Quantitative Analyst Intern", "company": "Goldman Sachs", "domain": "Finance & Tech", "type": "Paid", "mode": "Offline", "location": "Bangalore", "stipend": "₹80,000/month", "duration": "2 months", "description": "Develop quantitative models and algorithmic trading strategies.", "apply_link": "https://www.goldmansachs.com/careers/", "deadline": "2025-04-20"},
    {"title": "Platform Engineering Intern", "company": "Confluent", "domain": "DevOps", "type": "Paid", "mode": "Online", "stipend": "$4,000/month", "duration": "3 months", "description": "Work with Apache Kafka and build real-time data streaming solutions.", "apply_link": "https://confluent.io/careers/", "deadline": "2025-07-01"},
    {"title": "Open Source ML Intern", "company": "PyTorch Foundation", "domain": "AI", "type": "Paid", "mode": "Online", "stipend": "$2,000/month", "duration": "3 months", "description": "Contribute to PyTorch core libraries, documentation, and benchmarks.", "apply_link": "https://lfx.linuxfoundation.org/", "deadline": "2025-06-30"},
]


@router.get("")
def list_internships(
    domain: Optional[str] = Query(None, description="Filter by domain (e.g. AI, Web Dev)"),
    type: Optional[str] = Query(None, description="Paid | Unpaid"),
    mode: Optional[str] = Query(None, description="Online | Offline | Hybrid"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    """Return internships with optional filters."""
    stmt = select(Internship).where(Internship.is_active == True)
    results = db.exec(stmt).all()

    # If DB is empty, return seed data directly (before migration seeds)
    if not results:
        data = INTERNSHIP_SEED_DATA
        if domain:
            data = [i for i in data if domain.lower() in i["domain"].lower()]
        if type:
            data = [i for i in data if i["type"].lower() == type.lower()]
        if mode:
            data = [i for i in data if i["mode"].lower() == mode.lower()]
        return {"internships": data, "total": len(data)}

    if domain:
        results = [r for r in results if domain.lower() in r.domain.lower()]
    if type:
        results = [r for r in results if r.type.lower() == type.lower()]
    if mode:
        results = [r for r in results if r.mode.lower() == mode.lower()]

    return {"internships": [r.dict() for r in results], "total": len(results)}


@router.get("/domains")
def get_domains(current_user: User = Depends(get_current_user)):
    """Return list of available internship domains."""
    domains = list({i["domain"] for i in INTERNSHIP_SEED_DATA})
    return {"domains": sorted(domains)}
@router.get("/matches")
def get_matched_internships(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Intelligently recommends internships from the curated dataset based on the user's role and interests.
    """
    all_internships = db.exec(select(Internship)).all()
    if not all_internships:
        all_internships = [Internship(**i) for i in INTERNSHIP_SEED_DATA]

    # Matching Logic
    target_role = (current_user.target_role or "").lower()
    interests = (current_user.interest_areas or "").lower().split(",")
    matches = []

    for i in all_internships:
        score = 0
        desc = i.description.lower()
        title = i.title.lower()
        
        # Role match
        if target_role and (target_role in title or target_role in desc):
            score += 50
            
        # Interests match
        for interest in interests:
            if interest.strip() and (interest.strip() in title or interest.strip() in desc):
                score += 25
                
        if score > 0:
            matches.append({"internship": i if isinstance(i, dict) else i.dict(), "match_score": score})

    # Sort by score and take top 5
    matches = sorted(matches, key=lambda x: x["match_score"], reverse=True)[:5]
    return {"matches": matches}

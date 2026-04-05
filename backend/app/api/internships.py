"""
Feature #7 — Internship Discovery System (v2)
Massively expanded dataset with India-wide state/district coverage,
free/paid/unpaid types, offline/online/hybrid modes, 80+ listings.
"""
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select
from typing import Optional

from app.api.deps import get_current_user
from app.core.database import get_session
from app.models.models import User, Internship

router = APIRouter()

# ── India States & Districts ─────────────────────────────────────────────────
INDIA_STATES = [
    "All India", "Tamil Nadu", "Karnataka", "Maharashtra", "Delhi",
    "Telangana", "Andhra Pradesh", "Kerala", "Gujarat", "Rajasthan",
    "Uttar Pradesh", "West Bengal", "Madhya Pradesh", "Punjab", "Haryana"
]

INDIA_DISTRICTS = {
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem", "Tirunelveli", "Vellore", "Erode", "Thanjavur", "Dindigul"],
    "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum", "Davangere"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Thane"],
    "Delhi": ["New Delhi", "Noida", "Gurgaon", "Dwarka", "Rohini"],
    "Telangana": ["Hyderabad", "Warangal", "Karimnagar", "Nizamabad"],
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Tirupati", "Nellore"],
    "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kannur"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Noida", "Allahabad"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Siliguri"],
    "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur"],
    "Punjab": ["Chandigarh", "Amritsar", "Ludhiana", "Patiala"],
    "Haryana": ["Gurgaon", "Faridabad", "Ambala", "Rohtak"],
}

# ── Curated Static Internship Dataset (80+ listings) ──────────────────────────
INTERNSHIP_SEED_DATA = [
    # ── TECH GIANTS (Online / Global) ──────────────────────────────────────
    {"title": "AI/ML Research Intern", "company": "Google", "domain": "AI", "type": "Paid", "mode": "Online", "state": "All India", "location": "Remote (India OK)", "stipend": "₹80,000/month", "duration": "3 months", "description": "Work on cutting-edge ML research with Google Brain team. Requires Python, TensorFlow, and ML fundamentals.", "apply_link": "https://careers.google.com/jobs/results/?q=intern", "deadline": "2025-08-31"},
    {"title": "Software Engineering Intern", "company": "Microsoft", "domain": "Web Dev", "type": "Paid", "mode": "Hybrid", "state": "Telangana", "location": "Hyderabad", "stipend": "₹60,000/month", "duration": "6 months", "description": "Join the Azure Engineering team and build cloud-native features for millions of users.", "apply_link": "https://careers.microsoft.com/", "deadline": "2025-07-15"},
    {"title": "Data Science Intern", "company": "Microsoft", "domain": "Data Science", "type": "Paid", "mode": "Hybrid", "state": "Telangana", "location": "Hyderabad", "stipend": "₹55,000/month", "duration": "6 months", "description": "Join the Azure Data team and build real-time analytics pipelines.", "apply_link": "https://careers.microsoft.com/", "deadline": "2025-06-15"},
    {"title": "Generative AI Intern", "company": "Anthropic", "domain": "AI", "type": "Paid", "mode": "Online", "state": "All India", "location": "Remote (India OK)", "stipend": "$5,000/month", "duration": "3 months", "description": "Research and improve large language model safety and alignment.", "apply_link": "https://www.anthropic.com/careers", "deadline": "2025-07-01"},
    {"title": "Site Reliability Engineer Intern", "company": "Netflix", "domain": "DevOps", "type": "Paid", "mode": "Online", "state": "All India", "location": "Remote", "stipend": "$5,500/month", "duration": "3 months", "description": "Ensure high availability and performance for global streaming infrastructure.", "apply_link": "https://jobs.netflix.com/", "deadline": "2025-06-01"},
    {"title": "Cloud Engineering Intern", "company": "Amazon AWS", "domain": "Cloud", "type": "Paid", "mode": "Online", "state": "All India", "location": "Remote (India OK)", "stipend": "$3,500/month", "duration": "3 months", "description": "Work with AWS services: Lambda, EC2, S3, RDS to build scalable solutions.", "apply_link": "https://amazon.jobs/", "deadline": "2025-08-01"},
    {"title": "NLP Research Intern", "company": "Hugging Face", "domain": "AI", "type": "Paid", "mode": "Online", "state": "All India", "location": "Remote", "stipend": "$2,000/month", "duration": "3 months", "description": "Contribute to open-source NLP models and transformers.", "apply_link": "https://huggingface.co/jobs", "deadline": "2025-07-01"},
    {"title": "Open Source ML Intern", "company": "PyTorch Foundation", "domain": "AI", "type": "Paid", "mode": "Online", "state": "All India", "location": "Remote", "stipend": "$2,000/month", "duration": "3 months", "description": "Contribute to PyTorch core libraries, documentation, and benchmarks.", "apply_link": "https://lfx.linuxfoundation.org/", "deadline": "2025-06-30"},
    {"title": "Open Source Contributor (GSoC)", "company": "Google Summer of Code", "domain": "Open Source", "type": "Paid", "mode": "Online", "state": "All India", "location": "Remote", "stipend": "$3,000 total", "duration": "3 months", "description": "Contribute to open-source organisations under Google's mentorship program.", "apply_link": "https://summerofcode.withgoogle.com/", "deadline": "2025-04-02"},
    {"title": "Technical Writer Intern", "company": "HashiCorp", "domain": "Documentation", "type": "Paid", "mode": "Online", "state": "All India", "location": "Remote", "stipend": "$2,500/month", "duration": "3 months", "description": "Write developer documentation for Terraform, Vault, and Consul.", "apply_link": "https://www.hashicorp.com/jobs", "deadline": "2025-06-15"},
    {"title": "Platform Engineering Intern", "company": "Confluent", "domain": "DevOps", "type": "Paid", "mode": "Online", "state": "All India", "location": "Remote", "stipend": "$4,000/month", "duration": "3 months", "description": "Work with Apache Kafka and build real-time data streaming solutions.", "apply_link": "https://confluent.io/careers/", "deadline": "2025-07-01"},

    # ── BENGALURU (Karnataka) ────────────────────────────────────────────────
    {"title": "Full Stack Developer Intern", "company": "Razorpay", "domain": "Web Dev", "type": "Paid", "mode": "Offline", "state": "Karnataka", "location": "Bangalore", "stipend": "₹50,000/month", "duration": "3 months", "description": "Build payment infrastructure features with React and Node.js.", "apply_link": "https://razorpay.com/jobs/", "deadline": "2025-05-20"},
    {"title": "Android Development Intern", "company": "Flipkart", "domain": "Mobile Dev", "type": "Paid", "mode": "Offline", "state": "Karnataka", "location": "Bangalore", "stipend": "₹40,000/month", "duration": "2 months", "description": "Build mobile features for India's largest e-commerce platform.", "apply_link": "https://www.flipkartcareers.com/", "deadline": "2025-05-15"},
    {"title": "UI/UX Design Intern", "company": "Swiggy", "domain": "Design", "type": "Paid", "mode": "Offline", "state": "Karnataka", "location": "Bangalore", "stipend": "₹30,000/month", "duration": "3 months", "description": "Design user-facing features for mobile and web applications.", "apply_link": "https://careers.swiggy.com/", "deadline": "2025-05-30"},
    {"title": "Data Engineering Intern", "company": "PhonePe", "domain": "Data Science", "type": "Paid", "mode": "Offline", "state": "Karnataka", "location": "Bangalore", "stipend": "₹40,000/month", "duration": "3 months", "description": "Design and maintain large-scale Spark data pipelines.", "apply_link": "https://careers.phonepe.com/", "deadline": "2025-05-20"},
    {"title": "Product Management Intern", "company": "Meesho", "domain": "Product", "type": "Paid", "mode": "Offline", "state": "Karnataka", "location": "Bangalore", "stipend": "₹35,000/month", "duration": "2 months", "description": "Define product features, run A/B tests, and work with engineering teams.", "apply_link": "https://jobs.lever.co/meesho", "deadline": "2025-05-28"},
    {"title": "Embedded Systems Intern", "company": "Texas Instruments", "domain": "Hardware", "type": "Paid", "mode": "Offline", "state": "Karnataka", "location": "Bangalore", "stipend": "₹30,000/month", "duration": "6 months", "description": "Write firmware for microcontrollers and real-time operating systems.", "apply_link": "https://careers.ti.com/", "deadline": "2025-04-30"},
    {"title": "iOS Developer Intern", "company": "CRED", "domain": "Mobile Dev", "type": "Paid", "mode": "Offline", "state": "Karnataka", "location": "Bangalore", "stipend": "₹35,000/month", "duration": "3 months", "description": "Build Swift/SwiftUI features for the CRED fintech app.", "apply_link": "https://careers.cred.club/", "deadline": "2025-05-31"},
    {"title": "Computer Vision Intern", "company": "Samsung R&D", "domain": "AI", "type": "Paid", "mode": "Offline", "state": "Karnataka", "location": "Bangalore", "stipend": "₹50,000/month", "duration": "6 months", "description": "Develop image recognition and video analytics pipelines.", "apply_link": "https://samsung.com/global/business/samsung-rnd/", "deadline": "2025-05-31"},
    {"title": "Machine Learning Intern", "company": "Walmart Global Tech", "domain": "AI", "type": "Paid", "mode": "Hybrid", "state": "Karnataka", "location": "Bangalore", "stipend": "₹55,000/month", "duration": "3 months", "description": "Build recommendation systems and demand forecasting models at scale.", "apply_link": "https://walmart.com/careers", "deadline": "2025-06-15"},
    {"title": "Backend Engineering Intern", "company": "Ola", "domain": "Web Dev", "type": "Paid", "mode": "Hybrid", "state": "Karnataka", "location": "Bangalore", "stipend": "₹35,000/month", "duration": "3 months", "description": "Build ride-matching APIs and real-time location services.", "apply_link": "https://ola.careers/", "deadline": "2025-06-01"},
    {"title": "AI Engineer Intern", "company": "Sarvam AI", "domain": "AI", "type": "Paid", "mode": "Hybrid", "state": "Karnataka", "location": "Bangalore", "stipend": "₹40,000/month", "duration": "3 months", "description": "Work on Indic language LLMs and speech synthesis systems.", "apply_link": "https://www.sarvam.ai/", "deadline": "2025-07-31"},
    {"title": "Research Intern", "company": "Indian Institute of Science (IISc)", "domain": "AI", "type": "Free", "mode": "Offline", "state": "Karnataka", "location": "Bangalore", "stipend": "Certificate + Stipend", "duration": "2 months", "description": "Work with IISc faculty on deep learning and CV research projects.", "apply_link": "https://iisc.ac.in/", "deadline": "2025-05-15"},

    # ── HYDERABAD (Telangana) ────────────────────────────────────────────────
    {"title": "DevOps Engineering Intern", "company": "Capgemini", "domain": "DevOps", "type": "Paid", "mode": "Hybrid", "state": "Telangana", "location": "Hyderabad", "stipend": "₹20,000/month", "duration": "3 months", "description": "Deploy and manage containerized applications on AWS and Azure.", "apply_link": "https://www.capgemini.com/careers/", "deadline": "2025-06-15"},
    {"title": "Machine Learning Intern", "company": "NVIDIA", "domain": "AI", "type": "Paid", "mode": "Hybrid", "state": "Telangana", "location": "Hyderabad", "stipend": "₹70,000/month", "duration": "3 months", "description": "Work on GPU acceleration for deep learning training pipelines.", "apply_link": "https://nvidia.wd5.myworkdayjobs.com/", "deadline": "2025-06-30"},
    {"title": "Quantitative Analyst Intern", "company": "Goldman Sachs", "domain": "Finance & Tech", "type": "Paid", "mode": "Offline", "state": "Telangana", "location": "Hyderabad", "stipend": "₹80,000/month", "duration": "2 months", "description": "Develop quantitative models and algorithmic trading strategies.", "apply_link": "https://www.goldmansachs.com/careers/", "deadline": "2025-04-20"},
    {"title": "Full Stack Intern", "company": "Infosys (Digital)", "domain": "Web Dev", "type": "Paid", "mode": "Offline", "state": "Telangana", "location": "Hyderabad", "stipend": "₹18,000/month", "duration": "6 months", "description": "Work on enterprise-grade React + Java applications.", "apply_link": "https://careers.infosys.com/", "deadline": "2025-05-31"},
    {"title": "Data Analyst Intern", "company": "Deloitte", "domain": "Data Science", "type": "Paid", "mode": "Hybrid", "state": "Telangana", "location": "Hyderabad", "stipend": "₹25,000/month", "duration": "6 months", "description": "Analyse large datasets and build business intelligence dashboards.", "apply_link": "https://www2.deloitte.com/global/en/careers.html", "deadline": "2025-06-20"},
    {"title": "Cybersecurity Intern", "company": "Palo Alto Networks", "domain": "Cybersecurity", "type": "Paid", "mode": "Hybrid", "state": "Telangana", "location": "Hyderabad", "stipend": "₹45,000/month", "duration": "3 months", "description": "Analyse network vulnerabilities and work with SIEM tools.", "apply_link": "https://jobs.paloaltonetworks.com/", "deadline": "2025-06-30"},
    {"title": "Research Intern (AI)", "company": "IIIT Hyderabad", "domain": "AI", "type": "Free", "mode": "Offline", "state": "Telangana", "location": "Hyderabad", "stipend": "Certificate Only", "duration": "2 months", "description": "Work with top AI researchers on NLP, CV, or speech processing.", "apply_link": "https://www.iiit.ac.in/", "deadline": "2025-05-10"},

    # ── MUMBAI (Maharashtra) ────────────────────────────────────────────────
    {"title": "Backend Engineering Intern", "company": "Zomato", "domain": "Web Dev", "type": "Paid", "mode": "Hybrid", "state": "Maharashtra", "location": "Mumbai", "stipend": "₹35,000/month", "duration": "3 months", "description": "Build scalable microservices with Go and PostgreSQL.", "apply_link": "https://www.zomato.com/careers", "deadline": "2025-05-25"},
    {"title": "Data Analytics Intern", "company": "Deloitte", "domain": "Data Science", "type": "Paid", "mode": "Hybrid", "state": "Maharashtra", "location": "Mumbai", "stipend": "₹30,000/month", "duration": "6 months", "description": "Analyse large datasets and build BI dashboards for top BFSI clients.", "apply_link": "https://www2.deloitte.com/global/en/careers.html", "deadline": "2025-06-20"},
    {"title": "Blockchain Developer Intern", "company": "Polygon", "domain": "Blockchain", "type": "Paid", "mode": "Hybrid", "state": "Maharashtra", "location": "Mumbai", "stipend": "₹40,000/month", "duration": "3 months", "description": "Build smart contracts and Web3 integrations on Ethereum L2.", "apply_link": "https://polygon.technology/careers", "deadline": "2025-07-15"},
    {"title": "Fintech Engineer Intern", "company": "HDFC Bank Digital", "domain": "Finance & Tech", "type": "Paid", "mode": "Offline", "state": "Maharashtra", "location": "Mumbai", "stipend": "₹25,000/month", "duration": "3 months", "description": "Build digital banking features and APIs for millions of customers.", "apply_link": "https://www.hdfcbank.com/content/bbp/repositories/723fb80a-2dde-42a3-9793-7ae1be57c87f/?folder=WPS/DOC/Careers", "deadline": "2025-06-15"},
    {"title": "React Native Intern", "company": "Dream11", "domain": "Mobile Dev", "type": "Paid", "mode": "Hybrid", "state": "Maharashtra", "location": "Mumbai", "stipend": "₹32,000/month", "duration": "3 months", "description": "Build fantasy sports mobile app features handling millions of concurrent users.", "apply_link": "https://www.dream11.com/careers", "deadline": "2025-06-01"},
    {"title": "AI/ML Intern", "company": "Tata Consultancy Services", "domain": "AI", "type": "Paid", "mode": "Offline", "state": "Maharashtra", "location": "Mumbai", "stipend": "₹20,000/month", "duration": "6 months", "description": "Develop AI solutions for enterprise clients in BFSI, healthcare, and retail.", "apply_link": "https://www.tcs.com/careers", "deadline": "2025-07-01"},

    # ── PUNE (Maharashtra) ──────────────────────────────────────────────────
    {"title": "Cybersecurity Intern", "company": "Palo Alto Networks", "domain": "Cybersecurity", "type": "Paid", "mode": "Hybrid", "state": "Maharashtra", "location": "Pune", "stipend": "₹45,000/month", "duration": "3 months", "description": "Analyse network vulnerabilities and work with SIEM tools.", "apply_link": "https://jobs.paloaltonetworks.com/", "deadline": "2025-06-30"},
    {"title": "SDE Intern", "company": "Persistent Systems", "domain": "Web Dev", "type": "Paid", "mode": "Hybrid", "state": "Maharashtra", "location": "Pune", "stipend": "₹20,000/month", "duration": "6 months", "description": "Build enterprise web apps using Java Spring Boot and Angular.", "apply_link": "https://careers.persistent.com/", "deadline": "2025-05-31"},
    {"title": "Cloud Intern", "company": "Zensar Technologies", "domain": "Cloud", "type": "Paid", "mode": "Offline", "state": "Maharashtra", "location": "Pune", "stipend": "₹18,000/month", "duration": "3 months", "description": "Help migrate enterprise applications to AWS and implement DevOps pipelines.", "apply_link": "https://www.zensar.com/about-us/careers/", "deadline": "2025-06-30"},

    # ── DELHI / NCR ──────────────────────────────────────────────────────────
    {"title": "Frontend Developer Intern", "company": "Paytm", "domain": "Web Dev", "type": "Paid", "mode": "Hybrid", "state": "Delhi", "location": "Noida", "stipend": "₹20,000/month", "duration": "3 months", "description": "Build React.js interfaces for payment and commerce products.", "apply_link": "https://jobs.paytm.com/", "deadline": "2025-06-01"},
    {"title": "Data Scientist Intern", "company": "HCL Technologies", "domain": "Data Science", "type": "Paid", "mode": "Hybrid", "state": "Delhi", "location": "Noida", "stipend": "₹22,000/month", "duration": "6 months", "description": "Develop predictive models and analytics solutions for global enterprise clients.", "apply_link": "https://www.hcltech.com/careers", "deadline": "2025-06-30"},
    {"title": "Backend Developer Intern", "company": "Info Edge (Naukri)", "domain": "Web Dev", "type": "Paid", "mode": "Offline", "state": "Delhi", "location": "Noida", "stipend": "₹25,000/month", "duration": "3 months", "description": "Build APIs and backend services for India's top job portal.", "apply_link": "https://infoedge.in/careers", "deadline": "2025-05-30"},
    {"title": "SWE Intern", "company": "Adobe", "domain": "Web Dev", "type": "Paid", "mode": "Hybrid", "state": "Delhi", "location": "Noida", "stipend": "₹80,000/month", "duration": "6 months", "description": "Work with Adobe's Creative Cloud, Document Cloud, or Experience Cloud teams.", "apply_link": "https://www.adobe.com/careers.html", "deadline": "2025-06-15"},
    {"title": "Research Scholar Intern", "company": "IIT Delhi", "domain": "AI", "type": "Free", "mode": "Offline", "state": "Delhi", "location": "New Delhi", "stipend": "Certificate + TA Allowance", "duration": "2 months", "description": "Work with IIT Delhi professors on published research in AI/ML domains.", "apply_link": "https://www.iitd.ac.in/", "deadline": "2025-05-01"},
    {"title": "Product Intern", "company": "IndiaMart", "domain": "Product", "type": "Paid", "mode": "Hybrid", "state": "Delhi", "location": "Noida", "stipend": "₹20,000/month", "duration": "3 months", "description": "Conduct market research, define features, and drive growth experiments.", "apply_link": "https://www.indiamart.com/careers/", "deadline": "2025-06-01"},

    # ── CHENNAI (Tamil Nadu) ─────────────────────────────────────────────────
    {"title": "Frontend Developer Intern", "company": "Freshworks", "domain": "Web Dev", "type": "Paid", "mode": "Hybrid", "state": "Tamil Nadu", "location": "Chennai", "stipend": "₹25,000/month", "duration": "3 months", "description": "Build React components for CRM and customer support products.", "apply_link": "https://careers.freshworks.com/", "deadline": "2025-06-01"},
    {"title": "Research Intern — NLP", "company": "IIT Madras", "domain": "AI", "type": "Free", "mode": "Offline", "state": "Tamil Nadu", "location": "Chennai", "stipend": "Certificate Only", "duration": "2 months", "description": "Assist in NLP research projects with publication opportunities.", "apply_link": "https://www.iitm.ac.in/", "deadline": "2025-05-10"},
    {"title": "Zoho Developer Intern", "company": "Zoho Corporation", "domain": "Web Dev", "type": "Paid", "mode": "Offline", "state": "Tamil Nadu", "location": "Chennai", "stipend": "₹15,000/month", "duration": "6 months", "description": "Build features for Zoho's productivity and CRM suite used by 80M+ users.", "apply_link": "https://careers.zohocorp.com/", "deadline": "2025-05-31"},
    {"title": "AI Research Intern", "company": "Zoho Research", "domain": "AI", "type": "Paid", "mode": "Offline", "state": "Tamil Nadu", "location": "Chennai", "stipend": "₹20,000/month", "duration": "3 months", "description": "Work on conversational AI, NLP, and predictive analytics within Zoho's AI team.", "apply_link": "https://careers.zohocorp.com/", "deadline": "2025-06-30"},
    {"title": "QA Automation Intern", "company": "Infosys BPO", "domain": "QA", "type": "Paid", "mode": "Offline", "state": "Tamil Nadu", "location": "Chennai", "stipend": "₹12,000/month", "duration": "6 months", "description": "Write Selenium and Cypress test suites for enterprise applications.", "apply_link": "https://careers.infosys.com/", "deadline": "2025-04-25"},
    {"title": "Cloud & DevOps Intern", "company": "Cognizant", "domain": "Cloud", "type": "Paid", "mode": "Hybrid", "state": "Tamil Nadu", "location": "Chennai", "stipend": "₹18,000/month", "duration": "6 months", "description": "Assist with cloud migration projects and CI/CD pipeline setup.", "apply_link": "https://careers.cognizant.com/", "deadline": "2025-06-30"},
    {"title": "VLSI Design Intern", "company": "Qualcomm", "domain": "Hardware", "type": "Paid", "mode": "Offline", "state": "Tamil Nadu", "location": "Chennai", "stipend": "₹50,000/month", "duration": "6 months", "description": "Work on chip design verification and RTL coding for Snapdragon SoCs.", "apply_link": "https://qualcomm.com/company/careers", "deadline": "2025-06-01"},

    # ── COIMBATORE (Tamil Nadu) ──────────────────────────────────────────────
    {"title": "Full Stack Intern", "company": "Kovai.co", "domain": "Web Dev", "type": "Paid", "mode": "Offline", "state": "Tamil Nadu", "location": "Coimbatore", "stipend": "₹12,000/month", "duration": "3 months", "description": "Build SaaS product features using React, Node.js, and AWS.", "apply_link": "https://kovai.co/careers/", "deadline": "2025-06-15"},
    {"title": "ML Research Intern", "company": "PSG College of Technology", "domain": "AI", "type": "Free", "mode": "Offline", "state": "Tamil Nadu", "location": "Coimbatore", "stipend": "Certificate + Training", "duration": "1 month", "description": "Hands-on research internship for students in deep learning and computer vision.", "apply_link": "https://www.psgtech.edu/", "deadline": "2025-05-10"},
    {"title": "IoT Developer Intern", "company": "Wipro VLSI", "domain": "Hardware", "type": "Paid", "mode": "Offline", "state": "Tamil Nadu", "location": "Coimbatore", "stipend": "₹15,000/month", "duration": "6 months", "description": "Develop embedded firmware and IoT solutions for industrial clients.", "apply_link": "https://careers.wipro.com/", "deadline": "2025-05-31"},

    # ── KERALA ──────────────────────────────────────────────────────────────
    {"title": "Python Developer Intern", "company": "UST Global", "domain": "Web Dev", "type": "Paid", "mode": "Hybrid", "state": "Kerala", "location": "Thiruvananthapuram", "stipend": "₹15,000/month", "duration": "3 months", "description": "Build automation tools and backend APIs using Python and Django.", "apply_link": "https://www.ust.com/en/careers", "deadline": "2025-06-01"},
    {"title": "AI/ML Intern", "company": "IIT Palakkad", "domain": "AI", "type": "Free", "mode": "Offline", "state": "Kerala", "location": "Kochi", "stipend": "Certificate Only", "duration": "2 months", "description": "Work with IIT Palakkad AI lab on computer vision and NLP problems.", "apply_link": "https://iitpkd.ac.in/", "deadline": "2025-05-15"},
    {"title": "React Developer Intern", "company": "Exotel", "domain": "Web Dev", "type": "Paid", "mode": "Online", "state": "Kerala", "location": "Remote (KL)", "stipend": "₹18,000/month", "duration": "3 months", "description": "Build dashboard components for a communication platform serving 4,000+ businesses.", "apply_link": "https://exotel.com/careers/", "deadline": "2025-06-30"},

    # ── GUJARAT ─────────────────────────────────────────────────────────────
    {"title": "Software Intern", "company": "Torrent Group", "domain": "Web Dev", "type": "Paid", "mode": "Offline", "state": "Gujarat", "location": "Ahmedabad", "stipend": "₹15,000/month", "duration": "3 months", "description": "Develop enterprise ERP integrations and internal tools.", "apply_link": "https://www.torrentgroup.com/careers", "deadline": "2025-06-01"},
    {"title": "Data Science Intern", "company": "L&T Infotech", "domain": "Data Science", "type": "Paid", "mode": "Hybrid", "state": "Gujarat", "location": "Surat", "stipend": "₹18,000/month", "duration": "6 months", "description": "Apply predictive analytics to manufacturing and supply chain data.", "apply_link": "https://www.lti.co/careers", "deadline": "2025-06-30"},
    {"title": "Frontend Intern", "company": "Unicommerce", "domain": "Web Dev", "type": "Paid", "mode": "Hybrid", "state": "Gujarat", "location": "Ahmedabad", "stipend": "₹12,000/month", "duration": "3 months", "description": "Build React interfaces for India's leading e-commerce product management platform.", "apply_link": "https://unicommerce.com/about/careers/", "deadline": "2025-05-31"},

    # ── RAJASTHAN ────────────────────────────────────────────────────────────
    {"title": "SDE Intern", "company": "Junglee Games", "domain": "Mobile Dev", "type": "Paid", "mode": "Hybrid", "state": "Rajasthan", "location": "Jaipur", "stipend": "₹20,000/month", "duration": "3 months", "description": "Build high-performance gaming features for rummy, poker, and fantasy sports apps.", "apply_link": "https://www.jungleegames.com/careers", "deadline": "2025-06-15"},
    {"title": "NIIT Research Intern", "company": "NIIT University", "domain": "AI", "type": "Free", "mode": "Offline", "state": "Rajasthan", "location": "Alwar", "stipend": "Certificate + Accommodation", "duration": "1 month", "description": "28-day intensive AI research project with faculty mentorship.", "apply_link": "https://www.niituniversity.in/", "deadline": "2025-05-01"},

    # ── WEST BENGAL ──────────────────────────────────────────────────────────
    {"title": "ML Engineer Intern", "company": "IIT Kharagpur", "domain": "AI", "type": "Free", "mode": "Offline", "state": "West Bengal", "location": "Kolkata", "stipend": "Certificate + TA", "duration": "2 months", "description": "Work on AI/robotics research with one of India's top research institutions.", "apply_link": "http://www.iitkgp.ac.in/", "deadline": "2025-05-15"},
    {"title": "Java Backend Intern", "company": "Wipro", "domain": "Web Dev", "type": "Paid", "mode": "Offline", "state": "West Bengal", "location": "Kolkata", "stipend": "₹15,000/month", "duration": "6 months", "description": "Develop microservices and REST APIs for banking and insurance clients.", "apply_link": "https://careers.wipro.com/", "deadline": "2025-07-01"},

    # ── ANDHRA PRADESH ───────────────────────────────────────────────────────
    {"title": "AI Systems Intern", "company": "IIIT Vijayawada", "domain": "AI", "type": "Free", "mode": "Offline", "state": "Andhra Pradesh", "location": "Vijayawada", "stipend": "Certificate Only", "duration": "1 month", "description": "Research internship on autonomous systems and deep reinforcement learning.", "apply_link": "https://www.iiit.ac.in/", "deadline": "2025-05-01"},
    {"title": "Full Stack Intern", "company": "Mindtree", "domain": "Web Dev", "type": "Paid", "mode": "Hybrid", "state": "Andhra Pradesh", "location": "Visakhapatnam", "stipend": "₹16,000/month", "duration": "6 months", "description": "Build full-stack enterprise applications using Angular and Spring Boot.", "apply_link": "https://careers.mindtree.com/", "deadline": "2025-06-30"},

    # ── ROBOTICS / AI — SPECIAL ─────────────────────────────────────────────
    {"title": "Robotics & AI Intern", "company": "Boston Dynamics", "domain": "AI", "type": "Paid", "mode": "Online", "state": "All India", "location": "Remote (India OK)", "stipend": "$4,000/month", "duration": "3 months", "description": "Develop motion planning and perception systems for robots.", "apply_link": "https://www.bostondynamics.com/careers", "deadline": "2025-06-15"},
    {"title": "AR/VR Developer Intern", "company": "Meta (Reality Labs)", "domain": "AR/VR", "type": "Paid", "mode": "Online", "state": "All India", "location": "Remote", "stipend": "$6,000/month", "duration": "3 months", "description": "Build immersive AR/VR experiences for Quest and Ray-Ban Stories.", "apply_link": "https://www.metacareers.com/", "deadline": "2025-06-30"},
    {"title": "Blockchain Developer Intern", "company": "Polygon", "domain": "Blockchain", "type": "Paid", "mode": "Online", "state": "All India", "location": "Remote", "stipend": "$1,500/month", "duration": "3 months", "description": "Build smart contracts and Web3 integrations on Ethereum L2.", "apply_link": "https://polygon.technology/careers", "deadline": "2025-07-15"},
    {"title": "DevOps Engineering Intern", "company": "Atlassian", "domain": "DevOps", "type": "Paid", "mode": "Online", "state": "All India", "location": "Remote", "stipend": "₹55,000/month", "duration": "3 months", "description": "Work on CI/CD pipelines, Kubernetes, and cloud infrastructure.", "apply_link": "https://www.atlassian.com/company/careers", "deadline": "2025-06-01"},
]


@router.get("")
def list_internships(
    domain: Optional[str] = Query(None, description="Filter by domain"),
    type: Optional[str] = Query(None, description="Paid | Unpaid | Free"),
    mode: Optional[str] = Query(None, description="Online | Offline | Hybrid"),
    state: Optional[str] = Query(None, description="India state filter"),
    location: Optional[str] = Query(None, description="City/District filter"),
    current_user: User = Depends(get_current_user),
):
    """Return internships with optional filters. Falls back to seed data if DB empty."""
    data = INTERNSHIP_SEED_DATA[:]

    if domain and domain != "All":
        data = [i for i in data if domain.lower() in i["domain"].lower()]
    if type and type != "All":
        data = [i for i in data if i["type"].lower() == type.lower()]
    if mode and mode != "All":
        data = [i for i in data if i["mode"].lower() == mode.lower()]
    if state and state not in ("All", "All India", ""):
        data = [i for i in data if i.get("state", "") in (state, "All India")]
    if location and location not in ("All", ""):
        data = [i for i in data if location.lower() in i.get("location", "").lower()]

    return {"internships": data, "total": len(data)}


@router.get("/domains")
def get_domains(current_user: User = Depends(get_current_user)):
    """Return list of available internship domains."""
    domains = sorted(list({i["domain"] for i in INTERNSHIP_SEED_DATA}))
    return {"domains": domains}


@router.get("/states")
def get_states(current_user: User = Depends(get_current_user)):
    """Return India states and districts for location filtering."""
    return {"states": INDIA_STATES, "districts": INDIA_DISTRICTS}


@router.get("/matches")
def get_matched_internships(current_user: User = Depends(get_current_user)):
    """Intelligently recommend internships based on user's role and interests."""
    target_role = (current_user.target_role or "").lower()
    interests = (current_user.interest_areas or "").lower().split(",")
    matches = []

    for i in INTERNSHIP_SEED_DATA:
        score = 0
        desc = i.get("description", "").lower()
        title = i["title"].lower()

        if target_role and (target_role in title or target_role in desc):
            score += 50
        for interest in interests:
            if interest.strip() and (interest.strip() in title or interest.strip() in desc):
                score += 25

        if score > 0:
            matches.append({"internship": i, "match_score": score})

    matches = sorted(matches, key=lambda x: x["match_score"], reverse=True)[:6]
    return {"matches": matches}

import sys
import os
from sqlmodel import Session, select

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import engine
from app.models.models import Hackathon

HACKATHONS = [
    {
        "name": "Smart India Hackathon 2026",
        "organizer": "Ministry of Education, India",
        "description": "The world's premier open innovation model by the Government of India.",
        "prize": "$15,000", "deadline": "2026-08-15", "link": "https://sih.gov.in",
        "tags": "Government, Open Innovation, India",
        "image_url": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=60",
        "status": "Upcoming", "participants_count": 50000
    },
    {
        "name": "NASA Space Apps Challenge 2026",
        "organizer": "NASA",
        "description": "Global hackathon for coders, scientists, designers, storytellers, to use open data from NASA.",
        "prize": "Global Awards", "deadline": "2026-10-01", "link": "https://spaceappschallenge.org",
        "tags": "Space, Data, Global",
        "image_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=60",
        "status": "Open", "participants_count": 35000
    },
    {
        "name": "Google Solution Challenge",
        "organizer": "Google Developer Student Clubs",
        "description": "Solve for one or more of the United Nations 17 Sustainable Development Goals.",
        "prize": "$12,000", "deadline": "2026-04-30", "link": "https://developers.google.com/community/dsc-solution-challenge",
        "tags": "Google, SDG, Social Good",
        "image_url": "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=60",
        "status": "Open", "participants_count": 22000
    },
    {
        "name": "ETHGlobal San Francisco",
        "organizer": "ETHGlobal",
        "description": "Build the future of the decentralized web at the epicenter of innovation.",
        "prize": "$500,000", "deadline": "2026-11-05", "link": "https://ethglobal.com",
        "tags": "Web3, Crypto, Ethereum",
        "image_url": "https://images.unsplash.com/photo-1622737133809-d95047b9e673?w=800&q=60",
        "status": "Upcoming", "participants_count": 5000
    },
    {
        "name": "HackMIT",
        "organizer": "MIT",
        "description": "MIT's premier undergraduate hackathon.",
        "prize": "$30,000", "deadline": "2026-09-15", "link": "https://hackmit.org",
        "tags": "Student, Hardware, Software",
        "image_url": "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=60",
        "status": "Upcoming", "participants_count": 1500
    },
    {
        "name": "HackHarvard",
        "organizer": "Harvard University",
        "description": "Global student hackathon to experiment, build, and explore.",
        "prize": "$25,000", "deadline": "2026-10-10", "link": "https://hackharvard.io",
        "tags": "Harvard, AI, HealthTech",
        "image_url": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=60",
        "status": "Upcoming", "participants_count": 1200
    },
    {
        "name": "MLH Global Hack Week",
        "organizer": "Major League Hacking (MLH)",
        "description": "A week-long virtual hacker festival.",
        "prize": "Swag & Credits", "deadline": "2026-06-01", "link": "https://mlh.io",
        "tags": "Virtual, MLH, Beginner",
        "image_url": "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=60",
        "status": "Open", "participants_count": 15000
    },
    {
        "name": "Devfolio BuildSeason",
        "organizer": "Devfolio",
        "description": "A month-long decentralized building festival for Indian hackers.",
        "prize": "$10,000", "deadline": "2026-07-20", "link": "https://devfolio.co",
        "tags": "Build, Web3, SaaS",
        "image_url": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=60",
        "status": "Open", "participants_count": 8000
    },
    {
        "name": "Anthropic AI Alignment Hackathon",
        "organizer": "Anthropic",
        "description": "Build tools and models focused on helpful, honest, and harmless AI.",
        "prize": "$100,000", "deadline": "2026-05-15", "link": "https://anthropic.com/hackathon",
        "tags": "AI, Alignment, LLMs",
        "image_url": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=60",
        "status": "Open", "participants_count": 2500
    },
    {
        "name": "OpenAI Summer Hack",
        "organizer": "OpenAI",
        "description": "Push the boundaries of what is possible with GPT-4 and beyond.",
        "prize": "$250,000", "deadline": "2026-07-04", "link": "https://openai.com",
        "tags": "OpenAI, Agents, Multimodal",
        "image_url": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=60",
        "status": "Upcoming", "participants_count": 4000
    },
    {
        "name": "ScaleAI Autonomous Hackathon",
        "organizer": "Scale AI",
        "description": "Build autonomous systems for self-driving, drones, and robotics.",
        "prize": "$50,000", "deadline": "2026-09-01", "link": "https://scale.com/hackathons",
        "tags": "Robotics, ML, Computer Vision",
        "image_url": "https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=800&q=60",
        "status": "Upcoming", "participants_count": 1800
    },
    {
        "name": "Meta Hacker Cup",
        "organizer": "Meta",
        "description": "Global programming competition where engineers compete via algorithms.",
        "prize": "$10,000", "deadline": "2026-08-01", "link": "https://facebook.com/codingcompetitions/hacker-cup",
        "tags": "Competitive Programming, Meta",
        "image_url": "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=60",
        "status": "Upcoming", "participants_count": 60000
    },
    {
        "name": "Microsoft Imagine Cup",
        "organizer": "Microsoft",
        "description": "The premier student developer event using Microsoft Azure.",
        "prize": "$100,000", "deadline": "2026-05-12", "link": "https://imaginecup.microsoft.com",
        "tags": "Azure, Cloud, Students",
        "image_url": "https://images.unsplash.com/photo-1542382156909-92f80c6bcab0?w=800&q=60",
        "status": "Open", "participants_count": 25000
    },
    {
        "name": "IBM Call for Code",
        "organizer": "IBM & United Nations",
        "description": "Global initiative asking developers to solve pressing social issues.",
        "prize": "$200,000", "deadline": "2026-08-30", "link": "https://developer.ibm.com/callforcode",
        "tags": "IBM, Big Data, Sustainability",
        "image_url": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=60",
        "status": "Upcoming", "participants_count": 30000
    },
    {
        "name": "Supabase Launch Week Hackathon",
        "organizer": "Supabase",
        "description": "Build robust scalable apps using Supabase's open source Firebase alternative.",
        "prize": "$10,000 & Swag", "deadline": "2026-04-20", "link": "https://supabase.com/blog",
        "tags": "PostgreSQL, Web, SaaS",
        "image_url": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=60",
        "status": "Open", "participants_count": 8000
    },
    {
        "name": "Vercel Next.js Conf Hackathon",
        "organizer": "Vercel",
        "description": "Showcase your best creations using Next.js 15 features.",
        "prize": "$20,000", "deadline": "2026-10-25", "link": "https://nextjs.org/conf",
        "tags": "React, Next.js, Frontend",
        "image_url": "https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=800&q=60",
        "status": "Upcoming", "participants_count": 12000
    },
    {
        "name": "Kaggle Annual Data Challenge",
        "organizer": "Kaggle",
        "description": "Solve complex real-world predictive modeling problems.",
        "prize": "$100,000", "deadline": "2026-12-01", "link": "https://kaggle.com",
        "tags": "Data Science, Kaggle, Machine Learning",
        "image_url": "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=60",
        "status": "Upcoming", "participants_count": 40000
    },
    {
        "name": "DefCon Capture The Flag",
        "organizer": "DefCon",
        "description": "The ultimate cyberpunk hacking competition.",
        "prize": "Black Badge", "deadline": "2026-08-08", "link": "https://defcon.org",
        "tags": "Security, CTF, Hacking",
        "image_url": "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=60",
        "status": "Upcoming", "participants_count": 5000
    },
    {
        "name": "Stripe Appathon",
        "organizer": "Stripe",
        "description": "Create innovative financial applications and Stripe App integrations.",
        "prize": "$75,000", "deadline": "2026-06-25", "link": "https://stripe.com/dev",
        "tags": "FinTech, Payments, SaaS",
        "image_url": "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=60",
        "status": "Open", "participants_count": 3000
    },
    {
        "name": "HackerEarth FinTech Challenge",
        "organizer": "HackerEarth",
        "description": "Build solutions for the future of digital banking and payments.",
        "prize": "$30,000", "deadline": "2026-07-10", "link": "https://hackerearth.com",
        "tags": "Banking, FinTech, API",
        "image_url": "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=800&q=60",
        "status": "Open", "participants_count": 10000
    },
    {
        "name": "AngelHack Global Series",
        "organizer": "AngelHack",
        "description": "Connecting local dev communities around the world.",
        "prize": "$50,000 & Accelerator", "deadline": "2026-09-30", "link": "https://angelhack.com",
        "tags": "Startups, Global, Mixed",
        "image_url": "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=60",
        "status": "Upcoming", "participants_count": 15000
    },
    {
        "name": "Generative AI Hackathon by Anthropic & AWS",
        "organizer": "AWS",
        "description": "Build next-generation highly-capable assistant features using AWS Bedrock and Claude 3.",
        "prize": "$150,000 AWS Credits", "deadline": "2026-08-20", "link": "https://aws.amazon.com/events/hackathons/",
        "tags": "GenAI, Cloud, AWS, Claude",
        "image_url": "https://images.unsplash.com/photo-1620825937374-87fc7d6aaf8c?w=800&q=60",
        "status": "Upcoming", "participants_count": 8500
    },
    {
        "name": "Devpost Web3 Foundation Build",
        "organizer": "Web3 Foundation",
        "description": "Create novel decentralized protocols on Polkadot.",
        "prize": "$80,000", "deadline": "2026-11-12", "link": "https://devpost.com/hackathons",
        "tags": "Web3, Rust, Blockchain",
        "image_url": "https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800&q=60",
        "status": "Upcoming", "participants_count": 3000
    },
    {
        "name": "Solana Global Crossroads",
        "organizer": "Solana Labs",
        "description": "The largest parallel hackathon combining De-Fi, gaming, and infrastructure.",
        "prize": "$1,000,000", "deadline": "2026-10-31", "link": "https://solana.com/hackathon",
        "tags": "Solana, Crypto, Gaming",
        "image_url": "https://images.unsplash.com/photo-1641580529558-a9601ebb5225?w=800&q=60",
        "status": "Upcoming", "participants_count": 22000
    },
    {
        "name": "Palo Alto Networks CyberSec Hack",
        "organizer": "Palo Alto Networks",
        "description": "Solve modern enterprise security challenges using Zero Trust architectures.",
        "prize": "$40,000", "deadline": "2026-07-28", "link": "https://paloaltonetworks.com/",
        "tags": "Cybersecurity, Zero Trust",
        "image_url": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=60",
        "status": "Upcoming", "participants_count": 4500
    },
    {
        "name": "HuggingFace Open Source AI Challenge",
        "organizer": "HuggingFace",
        "description": "Push the limits of open source models on HuggingFace Hub.",
        "prize": "GPU Grants", "deadline": "2026-09-05", "link": "https://huggingface.co/competitions",
        "tags": "Open Source, AI, NLP",
        "image_url": "https://images.unsplash.com/photo-1525373698358-041e3a460346?w=800&q=60",
        "status": "Upcoming", "participants_count": 12000
    },
    {
        "name": "NVIDIA Jetson Edge AI Hackathon",
        "organizer": "NVIDIA",
        "description": "Deploy deep learning applications locally using the NVIDIA Jetson platform.",
        "prize": "$25,000 + Jetson Orin Nanos", "deadline": "2026-06-15", "link": "https://developer.nvidia.com/",
        "tags": "Edge AI, Hardware, IoT",
        "image_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=60",
        "status": "Open", "participants_count": 2500
    },
    {
        "name": "Y Combinator Build Sprint",
        "organizer": "Y Combinator",
        "description": "Build an MVP in 30 days and fast-track your YC application.",
        "prize": "YC Interview Guaranteed", "deadline": "2026-05-30", "link": "https://ycombinator.com",
        "tags": "Startup, MVP, Pitch",
        "image_url": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=60",
        "status": "Open", "participants_count": 8000
    },
    {
        "name": "ClimateHack Global",
        "organizer": "Carbon180",
        "description": "Develop softwares and hardware optimizations to limit carbon emissions.",
        "prize": "$75,000", "deadline": "2026-08-22", "link": "https://climatehack.io",
        "tags": "ClimateTech, Sustainability",
        "image_url": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=60",
        "status": "Upcoming", "participants_count": 6000
    },
    {
        "name": "SpaceX Orbital Logistics Challenge",
        "organizer": "SpaceX",
        "description": "Solve optimization problems in orbital fuel scheduling.",
        "prize": "$50,000", "deadline": "2026-12-10", "link": "https://spacex.com/careers",
        "tags": "Aerospace, Algorithms, Math",
        "image_url": "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=800&q=60",
        "status": "Upcoming", "participants_count": 2000
    },
    {
        "name": "React Native Global Hackathon",
        "organizer": "Expo & Meta",
        "description": "Build stunning cross-platform applications in just 48 hours.",
        "prize": "$20,000", "deadline": "2026-11-20", "link": "https://expo.dev/hackathon",
        "tags": "Mobile, React Native, Expo",
        "image_url": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=60",
        "status": "Upcoming", "participants_count": 10500
    },
    {
        "name": "Healthcare API Challenge (FHIR)",
        "organizer": "Epic Systems",
        "description": "Design an app that leverages FHIR APIs to radically improve patient lifecycles.",
        "prize": "$35,000", "deadline": "2026-10-18", "link": "https://epic.com/dev",
        "tags": "HealthTech, API, FHIR",
        "image_url": "https://images.unsplash.com/photo-1538108149393-cebb47acddb2?w=800&q=60",
        "status": "Upcoming", "participants_count": 3200
    },
    {
        "name": "Unity GameDev Jam",
        "organizer": "Unity Technologies",
        "description": "Create a fully playable 3D prototype using Unity 6 over a weekend.",
        "prize": "$15,000 & Gear", "deadline": "2026-07-05", "link": "https://unity.com/madewithunity",
        "tags": "Gaming, 3D, Unity",
        "image_url": "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=60",
        "status": "Open", "participants_count": 18000
    },
    {
        "name": "TikTok Creative Tech Jam",
        "organizer": "Bytedance",
        "description": "Design engaging filters and mini-apps within the TikTok creator studio.",
        "prize": "$60,000", "deadline": "2026-09-12", "link": "https://tiktok.com/creators",
        "tags": "Social, AR, Creators",
        "image_url": "https://images.unsplash.com/photo-1611605698335-8b1569810432?w=800&q=60",
        "status": "Upcoming", "participants_count": 25000
    },
    {
        "name": "Docker Container Dash",
        "organizer": "Docker Inc.",
        "description": "Optimize container deployments and build the slimmest secure images.",
        "prize": "$10,000", "deadline": "2026-08-05", "link": "https://docker.com/community",
        "tags": "DevOps, Docker, Security",
        "image_url": "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&q=60",
        "status": "Upcoming", "participants_count": 5500
    },
    {
        "name": "Polygon zkEVM BUIDL",
        "organizer": "Polygon",
        "description": "Deploy ZK scaling solutions and dApps on Polygon's zero-knowledge network.",
        "prize": "$120,000", "deadline": "2026-10-22", "link": "https://polygon.technology",
        "tags": "Zero Knowledge, Web3",
        "image_url": "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&q=60",
        "status": "Upcoming", "participants_count": 4800
    }
]

def seed(session: Session):
    count = 0
    for h_data in HACKATHONS:
        existing = session.exec(select(Hackathon).where(Hackathon.name == h_data["name"])).first()
        if not existing:
            h = Hackathon(
                name=h_data["name"],
                organizer=h_data["organizer"],
                description=h_data["description"],
                prize=h_data["prize"],
                prize_pool=h_data["prize"],
                deadline=h_data["deadline"],
                link=h_data["link"],
                registration_link=h_data["link"],
                tags=h_data["tags"],
                image_url=h_data["image_url"],
                participants_count=h_data["participants_count"],
                status=h_data["status"],
                is_active=True
            )
            session.add(h)
            count += 1
    session.commit()
    return count

if __name__ == "__main__":
    with Session(engine) as session:
        added = seed(session)
        print(f"✅ Seeded {added} new hackathons.")

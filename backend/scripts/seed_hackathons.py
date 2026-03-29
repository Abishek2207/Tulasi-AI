import random
from datetime import datetime, timedelta
from sqlmodel import Session, select
from app.models.models import Hackathon

def seed(session: Session):
    # Clear existing
    existing = session.exec(select(Hackathon)).all()
    for e in existing:
        session.delete(e)
    session.commit()

    hackathons_data = [
        # GLOBAL / ELITE
        {
            "name": "NASA Space Apps Challenge 2026",
            "organizer": "NASA",
            "description": "The largest annual global hackathon in the world, using NASA's open data to build innovative solutions to challenges we face on Earth and in space.",
            "prize_pool": "$25,000 + Global Recognition",
            "deadline": "2026-10-01",
            "registration_link": "https://www.spaceappschallenge.org/",
            "tags": "Space,AI,Data Science",
            "domains": "AI,Data Science,SpaceTech",
            "mode": "Hybrid",
            "difficulty": "Advanced",
            "team_size": "2-5 builders",
            "image_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
            "participants_count": 28000,
            "status": "Upcoming",
            "start_date": "2026-10-05",
            "end_date": "2026-10-07",
            "registration_deadline": "2026-10-01"
        },
        {
            "name": "Google Hash Code 2026",
            "organizer": "Google",
            "description": "Hash Code is a team programming competition organized by Google. You share your skills and connect with other coders as you work together to solve a real Google engineering problem.",
            "prize_pool": "$15,000 + Google Swag",
            "deadline": "2026-04-15",
            "registration_link": "https://codingcompetitions.withgoogle.com/hashcode",
            "tags": "Algorithms,DS&A,Optimization",
            "domains": "Algorithms,Optimization",
            "mode": "Online",
            "difficulty": "Advanced",
            "team_size": "2-4 builders",
            "image_url": "https://images.unsplash.com/photo-1573164713988-86259f97756d?w=800&q=80",
            "participants_count": 50000,
            "status": "Open",
            "start_date": "2026-04-20",
            "end_date": "2026-04-20",
            "registration_deadline": "2026-04-15"
        },
        {
            "name": "MLH Fellowship: Open Source",
            "organizer": "Major League Hacking",
            "description": "A 12-week internship alternative for aspiring software engineers to contribute to open source projects used by millions of people.",
            "prize_pool": "$5,000 Stipend",
            "deadline": "2026-05-30",
            "registration_link": "https://fellowship.mlh.io/",
            "tags": "Open Source,Software Engineering",
            "domains": "Web Dev,Open Source,DevOps",
            "mode": "Online",
            "difficulty": "Beginner",
            "team_size": "1 builder",
            "image_url": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
            "participants_count": 1000,
            "status": "Open",
            "start_date": "2026-06-01",
            "end_date": "2026-08-31",
            "registration_deadline": "2026-05-30"
        },
        {
            "name": "Chainlink Constellation",
            "organizer": "Chainlink",
            "description": "Constellation is the premier Web3 hackathon for building next-generation hybrid smart contracts using Chainlink's decentralized oracle network.",
            "prize_pool": "$350,000",
            "deadline": "2026-05-15",
            "registration_link": "https://chain.link/hackathon",
            "tags": "Web3,Blockchain,Smart Contracts",
            "domains": "Blockchain,Web3,DeFi",
            "mode": "Online",
            "difficulty": "Intermediate",
            "team_size": "1-4 builders",
            "image_url": "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80",
            "participants_count": 5000,
            "status": "Open",
            "start_date": "2026-05-20",
            "end_date": "2026-06-15",
            "registration_deadline": "2026-05-15"
        },
        # INDIA SPECIFIC
        {
            "name": "Smart India Hackathon 2026",
            "organizer": "Ministry of Education",
            "description": "SIH is a nationwide initiative to provide students with a platform to solve some of the pressing problems we face in our daily lives.",
            "prize_pool": "₹15,00,000",
            "deadline": "2026-08-20",
            "registration_link": "https://www.sih.gov.in/",
            "tags": "India,Hardware,Software,Social Impact",
            "domains": "IoT,Web Dev,Cybersecurity,AgriTech",
            "mode": "Offline",
            "difficulty": "Intermediate",
            "team_size": "6 builders",
            "image_url": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
            "participants_count": 15000,
            "status": "Upcoming",
            "start_date": "2026-09-10",
            "end_date": "2026-09-12",
            "registration_deadline": "2026-08-20",
            "location": "Nodal Centers, India"
        },
        {
            "name": "InOut 10.0",
            "organizer": "Devfolio",
            "description": "India's biggest community-driven hackathon is back for its 10th edition. Join developers from across the country for 48 hours of building.",
            "prize_pool": "₹5,00,000",
            "deadline": "2026-11-10",
            "registration_link": "https://devfolio.co/inout",
            "tags": "India,Community,Building",
            "domains": "Web Dev,AI,FinTech",
            "mode": "Offline",
            "difficulty": "Advanced",
            "team_size": "1-3 builders",
            "image_url": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80",
            "participants_count": 800,
            "status": "Upcoming",
            "start_date": "2026-11-20",
            "end_date": "2026-11-22",
            "registration_deadline": "2026-11-10",
            "location": "Bangalore, India"
        },
        {
            "name": "Microsoft Imagine Cup 2026",
            "organizer": "Microsoft",
            "description": "Empowering students to build world-changing solutions with Azure AI and cloud technologies.",
            "prize_pool": "$100,000 + Mentorship",
            "deadline": "2026-01-30",
            "registration_link": "https://imaginecup.microsoft.com/",
            "tags": "Azure,Cloud,AI,Social Impact",
            "domains": "AI,Cloud,Sustainability",
            "mode": "Hybrid",
            "difficulty": "Intermediate",
            "team_size": "1-4 builders",
            "image_url": "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=800&q=80",
            "participants_count": 12000,
            "status": "Open",
            "start_date": "2026-02-15",
            "end_date": "2026-05-20",
            "registration_deadline": "2026-01-30"
        },
        {
            "name": "ETHIndia 2026",
            "organizer": "Devfolio & ETHGlobal",
            "description": "Asia's largest Ethereum hackathon. Join 2,000+ builders to push the boundaries of Web3 in Bangalore.",
            "prize_pool": "$150,000",
            "deadline": "2026-12-01",
            "registration_link": "https://ethindia.co/",
            "tags": "Ethereum,Layer2,Zero Knowledge",
            "domains": "Web3,Blockchain,Cybersecurity",
            "mode": "Offline",
            "difficulty": "Advanced",
            "team_size": "1-4 builders",
            "image_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
            "participants_count": 2500,
            "status": "Upcoming",
            "start_date": "2026-12-05",
            "end_date": "2026-12-07",
            "registration_deadline": "2026-12-01",
            "location": "KTPO, Bangalore"
        },
    ]

    # Generate more to make it 30+
    domains_pool = ["AI", "Web Dev", "Mobile", "Web3", "Blockchain", "Cybersecurity", "IoT", "Cloud", "FinTech", "EdTech", "HealthTech", "AgriTech", "SaaS", "AR/VR"]
    organizers_pool = ["Meta", "AWS", "Apple", "Uber", "Zomato", "PhonePe", "Razorpay", "Polygon", "Solana", "GitHub", "DigitalOcean", "Twilio", "Postman", "Vercel"]
    modes = ["Online", "Offline", "Hybrid"]
    diffs = ["Beginner", "Intermediate", "Advanced"]
    
    for i in range(25):
        domain = random.choice(domains_pool)
        org = random.choice(organizers_pool)
        mode = random.choice(modes)
        diff = random.choice(diffs)
        
        # Consistent Dates
        base_date = datetime.now() + timedelta(days=random.randint(30, 180))
        reg_deadline = base_date - timedelta(days=random.randint(5, 15))
        start = base_date
        end = base_date + timedelta(days=random.randint(1, 3))
        
        hackathons_data.append({
            "name": f"{org} {domain} Hackathon v{random.randint(1, 10)}",
            "organizer": org,
            "description": f"Join {org} to build next-gen {domain} applications. Collaborate with builders across the globe for this exciting {random.randint(24, 48)} hour sprint.",
            "prize_pool": f"${random.randint(5, 50)}k" if i % 2 == 0 else f"₹{random.randint(1, 10)} Lakhs",
            "deadline": reg_deadline.strftime("%Y-%m-%d"),
            "registration_link": f"https://{org.lower()}.com/hackathon",
            "tags": f"{domain},Build,Code,{org}",
            "domains": domain,
            "mode": mode,
            "difficulty": diff,
            "team_size": f"1-{random.randint(2, 4)} builders",
            "image_url": f"https://images.unsplash.com/photo-{random.randint(1400000000000, 1600000000000)}?w=800&q=80",
            "participants_count": random.randint(200, 2000),
            "status": "Open",
            "start_date": start.strftime("%Y-%m-%d"),
            "end_date": end.strftime("%Y-%m-%d"),
            "registration_deadline": reg_deadline.strftime("%Y-%m-%d"),
            "location": f"{random.choice(['New York', 'London', 'Berlin', 'Mumbai', 'Singapore'])}" if mode != "Online" else None
        })

    added_count = 0
    for h_data in hackathons_data:
        h = Hackathon(
            name=h_data["name"],
            organizer=h_data["organizer"],
            description=h_data["description"],
            prize=h_data["prize_pool"],
            prize_pool=h_data["prize_pool"],
            deadline=h_data["deadline"],
            link=h_data["registration_link"],
            registration_link=h_data["registration_link"],
            tags=h_data["tags"],
            image_url=h_data["image_url"],
            participants_count=h_data["participants_count"],
            status=h_data["status"],
            mode=h_data.get("mode", "Online"),
            difficulty=h_data.get("difficulty", "Beginner"),
            team_size=h_data.get("team_size", "1-4 builders"),
            start_date=h_data.get("start_date"),
            end_date=h_data.get("end_date"),
            registration_deadline=h_data.get("registration_deadline"),
            domains=h_data.get("domains", ""),
            currency="INR" if "₹" in h_data["prize_pool"] else "USD",
            location=h_data.get("location")
        )
        session.add(h)
        added_count += 1
    
    session.commit()
    return added_count

if __name__ == "__main__":
    from app.core.database import engine
    with Session(engine) as session:
        count = seed(session)
        print(f"✅ Created {count} high-fidelity hackathons.")

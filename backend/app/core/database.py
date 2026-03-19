from sqlmodel import SQLModel, create_engine, Session, select
from sqlalchemy.pool import QueuePool
from app.core.config import settings

connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    settings.DATABASE_URL, 
    connect_args=connect_args,
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20,
    pool_timeout=30
)

def init_db():
    from app.models.models import Hackathon, StudyRoom  # Local import to avoid circular dependencies
    SQLModel.metadata.create_all(engine)
    
    # Seed Hackathons
    with Session(engine) as session:
        if not session.exec(select(Hackathon)).first():
            print("🌱 Seeding hackathons...")
            hackathons = [
                Hackathon(name="Google Summer of Code 2026", organizer="Google", description="Global open-source program with mentorship and stipend.", prize="$1500-$3300", prize_pool="$1500-$3300", deadline="March 20, 2026", link="https://summerofcode.withgoogle.com", registration_link="https://summerofcode.withgoogle.com", tags="open-source,competitive,global", status="Open", image_url="https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=800&auto=format&fit=crop&q=60", participants_count=18000),
                Hackathon(name="Smart India Hackathon 2026", organizer="Govt of India", description="World's biggest open innovation model solving real-world problems.", prize="₹1,00,000", prize_pool="₹1,00,000", deadline="April 15, 2026", link="https://sih.gov.in", registration_link="https://sih.gov.in", tags="india,social-good,competitive", status="Open", image_url="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60", participants_count=50000),
                Hackathon(name="MLH Global Hack Week", organizer="Major League Hacking", description="Beginner-friendly digital festival of learning and building.", prize="Swag & Cloud Credits", prize_pool="Swag & Cloud Credits", deadline="Every Month", link="https://ghw.mlh.io", registration_link="https://ghw.mlh.io", tags="beginner-friendly,global,all", status="Open", image_url="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=60", participants_count=5000),
                Hackathon(name="EthGlobal Web3 Hackathon", organizer="EthGlobal", description="Build the decentralized future on the Ethereum ecosystem.", prize="$50,000", prize_pool="$50,000", deadline="May 5, 2026", link="https://ethglobal.com", registration_link="https://ethglobal.com", tags="web3,competitive,global", status="Upcoming", image_url="https://images.unsplash.com/photo-1622737133809-d95047b9e673?w=800&auto=format&fit=crop&q=60", participants_count=3000),
                Hackathon(name="NASA Space Apps Challenge", organizer="NASA", description="Global hackathon utilizing NASA open data for Earth and space challenges.", prize="Global Recognition", prize_pool="Global Recognition", deadline="October 2, 2026", link="https://spaceappschallenge.org", registration_link="https://spaceappschallenge.org", tags="space,open-source,global", status="Upcoming", image_url="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&auto=format&fit=crop&q=60", participants_count=25000),
                Hackathon(name="HackMIT 2026", organizer="MIT", description="MIT's premier fall hackathon. Build innovative software and hardware projects.", prize="$10,000+", prize_pool="$10,000+", deadline="July 30, 2026", link="https://hackmit.org", registration_link="https://hackmit.org", tags="competitive,collegiate", status="Upcoming", image_url="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=60", participants_count=2000),
                Hackathon(name="Meta XR Hackathon", organizer="Meta Platforms", description="Create next-gen AR/VR experiences using Meta Quest and Spark AR.", prize="$25,000", prize_pool="$25,000", deadline="August 12, 2026", link="https://meta.com/hackathons", registration_link="https://meta.com/hackathons", tags="ar-vr,competitive", status="Upcoming", image_url="https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800&auto=format&fit=crop&q=60", participants_count=1500),
                Hackathon(name="Claude AI App Challenge", organizer="Anthropic", description="Build innovative, helpful AI applications using the Claude 3.5 API.", prize="$15,000 & Credits", prize_pool="$15,000", deadline="June 10, 2026", link="https://anthropic.com", registration_link="https://anthropic.com", tags="ai,competitive", status="Open", image_url="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=60", participants_count=2500),
                Hackathon(name="Vercel AI Hackathon", organizer="Vercel", description="Build the fastest AI web applications using Next.js and Vercel AI SDK.", prize="$5,000 + Pro Plans", prize_pool="$5,000", deadline="April 30, 2026", link="https://vercel.com/ai", registration_link="https://vercel.com/ai", tags="ai,frontend,web", status="Open", image_url="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60", participants_count=3500),
                Hackathon(name="OpenAI Developer Challenge", organizer="OpenAI", description="Push the boundaries with GPT-4 and Whisper APIs by building transformative AI tools.", prize="$50,000 Credits", prize_pool="$50,000", deadline="August 1, 2026", link="https://openai.com", registration_link="https://openai.com", tags="ai,global", status="Upcoming", image_url="https://images.unsplash.com/photo-1591453089816-0fbb971b454c?w=800&auto=format&fit=crop&q=60", participants_count=8000),
                Hackathon(name="Hugging Face Open AI Hack", organizer="Hugging Face", description="Contribute to open-source AI models, spaces, and datasets.", prize="Community Recognition", prize_pool="Community Recognition", deadline="Ongoing", link="https://huggingface.co", registration_link="https://huggingface.co", tags="ai,open-source", status="Open", image_url="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=60", participants_count=10000),
                Hackathon(name="Devfolio Ethereum India", organizer="Devfolio", description="India's largest Web3 hackathon. Build DApps, DAOs, and DeFi protocols.", prize="₹5,00,000", prize_pool="₹5,00,000", deadline="September 15, 2026", link="https://ethindia.co", registration_link="https://ethindia.co", tags="web3,india", status="Upcoming", image_url="https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800&auto=format&fit=crop&q=60", participants_count=4000),
                Hackathon(name="Stripe Payments Hackathon", organizer="Stripe", description="Innovate the future of online commerce with Stripe's payment infrastructure.", prize="$10,000", prize_pool="$10,000", deadline="July 20, 2026", link="https://stripe.com", registration_link="https://stripe.com", tags="fintech,web", status="Upcoming", image_url="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=60", participants_count=2000),
                Hackathon(name="Kaggle Data Science Bowl", organizer="Kaggle", description="Tackle complex data science and ML problems alongside top data scientists.", prize="$100,000", prize_pool="$100,000", deadline="December 15, 2026", link="https://kaggle.com", registration_link="https://kaggle.com", tags="ai,data-science,competitive", status="Upcoming", image_url="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60", participants_count=15000),
                Hackathon(name="Green Tech ClimateHack", organizer="Climate Collective", description="Build software to combat climate change and optimize renewable energy grids.", prize="$5,000", prize_pool="$5,000", deadline="November 1, 2026", link="https://climatehack.org", registration_link="https://climatehack.org", tags="social-good,global", status="Upcoming", image_url="https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=800&auto=format&fit=crop&q=60", participants_count=1200),
                Hackathon(name="Supabase Launch Week Hack", organizer="Supabase", description="Build complete, scalable backend applications using Supabase and Edge Functions.", prize="Exclusive Swag", prize_pool="Exclusive Swag", deadline="Quarterly", link="https://supabase.com", registration_link="https://supabase.com", tags="backend,open-source", status="Open", image_url="https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60", participants_count=2500),
                Hackathon(name="Polygon BuildIt Hackathon", organizer="Polygon", description="Deploy highly scalable dApps on the Polygon network with zero gas fees.", prize="$20,000", prize_pool="$20,000", deadline="October 20, 2026", link="https://polygon.technology", registration_link="https://polygon.technology", tags="web3,competitive", status="Upcoming", image_url="https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800&auto=format&fit=crop&q=60", participants_count=3000),
                Hackathon(name="Healthcare AI Innovation", organizer="Mayo Clinic", description="Design AI applications that improve patient diagnosis and care delivery.", prize="$15,000", prize_pool="$15,000", deadline="July 5, 2026", link="https://healthai.org", registration_link="https://healthai.org", tags="ai,healthcare,social-good", status="Upcoming", image_url="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=60", participants_count=1500),
                Hackathon(name="Roblox Studio Creator Challenge", organizer="Roblox", description="Design engaging 3D multiplayer experiences using Roblox Studio and Lua.", prize="$5,000 + Robux", prize_pool="$5,000", deadline="June 25, 2026", link="https://roblox.com/create", registration_link="https://roblox.com/create", tags="gaming,beginner-friendly", status="Open", image_url="https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800&auto=format&fit=crop&q=60", participants_count=8000),
                Hackathon(name="Docker Container Hack", organizer="Docker", description="Build tools that improve the developer experience with containerized systems.", prize="$8,000", prize_pool="$8,000", deadline="September 10, 2026", link="https://docker.com", registration_link="https://docker.com", tags="devops,global", status="Upcoming", image_url="https://images.unsplash.com/photo-1518432031352-d6fc5734c3d?w=800&auto=format&fit=crop&q=60", participants_count=2500),
            ]
            for h in hackathons:
                session.add(h)
            session.commit()
            print(f"✅ Seeded {len(hackathons)} hackathons!")

    # Seed Study Rooms
    with Session(engine) as session:
        if not session.exec(select(StudyRoom)).first():
            # Need a system user ID — use 1 as placeholder (admin)
            from app.models.models import StudyRoom as SR
            default_rooms = [
                SR(name="DSA & LeetCode Prep", description="Daily coding challenges and algorithm discussions.", tag="Interview", color="#FF6B6B", created_by=1),
                SR(name="Web3 Builders", description="Smart contracts, DeFi, and Web3 project discussions.", tag="Blockchain", color="#4ECDC4", created_by=1),
                SR(name="AI/ML Researchers", description="Deep learning, model training, and research papers.", tag="Machine Learning", color="#6C63FF", created_by=1),
                SR(name="Indie Hackers", description="Startup ideas, side projects, and growth hacking.", tag="Startups", color="#FFD93D", created_by=1),
            ]
            for r in default_rooms:
                try:
                    session.add(r)
                    session.commit()
                except Exception:
                    session.rollback()  # Skip if user 1 doesn't exist yet
            print("✅ Study rooms seeded!")

def get_session():
    with Session(engine) as session:
        yield session

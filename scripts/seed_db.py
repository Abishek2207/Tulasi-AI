import asyncio
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from sqlmodel import Session, select
from passlib.context import CryptContext
from datetime import datetime, timedelta
import random

from app.core.database import engine
from app.models.models import User, HackathonBookmark, Group, GroupMember, GroupMessage

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
def get_password_hash(password):
    return pwd_context.hash(password)

def seed_users(session: Session):
    print("Seeding Users...")
    existing = session.exec(select(User)).all()
    if len(existing) > 5:
        print("Users already seeded.")
        return existing
    
    users = []
    names = ["Alex Chen", "Samantha Lee", "Jordan Davis", "Marcus Johnson", "Elena Rodriguez", "Chris Taylor", "David Kim", "Priya Patel", "Sophia Martinez", "Liam Brown"]
    for i, name in enumerate(names):
        u = User(
            email=f"user{i}@tulasi.ai",
            name=name,
            hashed_password=get_password_hash("password123"),
            xp=random.randint(100, 25000),
            level=random.randint(1, 15),
            streak=random.randint(0, 45),
            longest_streak=random.randint(10, 60),
            bio=f"Passionate software engineer building cool things.",
            skills="React, FastAPI, PostgreSQL, Typescript",
            problems_solved=random.randint(0, 150),
            created_at=datetime.utcnow() - timedelta(days=random.randint(10, 100)),
            last_activity_date=datetime.utcnow() - timedelta(days=random.randint(0, 2))
        )
        session.add(u)
        users.append(u)
    session.commit()
    for u in users: session.refresh(u)
    print(f"Added {len(users)} users.")
    return users

def seed_groups(session: Session, users: list[User]):
    print("Seeding Groups...")
    existing = session.exec(select(Group)).all()
    if existing:
        print("Groups already seeded.")
        return
    
    group_data = [
        {"name": "FAANG Prep 2026", "desc": "Grinding LeetCode daily and doing mock interviews.", "code": "FAANG1"},
        {"name": "React Native Builders", "desc": "Building mobile apps together using Expo router.", "code": "RNBUILD"},
        {"name": "AI Agents Study Group", "desc": "Discussing LangChain, LLMs, and RAG pipelines.", "code": "AGENTS"},
    ]

    for data in group_data:
        creator = random.choice(users)
        g = Group(
            name=data["name"],
            description=data["desc"],
            join_code=data["code"],
            created_by=creator.id
        )
        session.add(g)
        session.commit()
        session.refresh(g)

        # Add creator as member
        gm = GroupMember(group_id=g.id, user_id=creator.id)
        session.add(gm)

        # Add random other members
        other_members = random.sample([u for u in users if u.id != creator.id], random.randint(2, 5))
        for om in other_members:
            gm = GroupMember(group_id=g.id, user_id=om.id)
            session.add(gm)
        
        # Add some messages
        for _ in range(5):
            sender = random.choice([creator] + other_members)
            msg = GroupMessage(
                group_id=g.id,
                user_id=sender.id,
                content=random.choice(["Hey guys!", "Did anyone solve today's challenge?", "I found a great resource for this.", "Let's hop on a call later.", "Check out my new repo!"]),
                created_at=datetime.utcnow() - timedelta(hours=random.randint(1, 48))
            )
            session.add(msg)
            
        session.commit()
    print(f"Added {len(group_data)} groups with members and messages.")

def main():
    with Session(engine) as session:
        print("Starting seeding process...")
        users = seed_users(session)
        seed_groups(session, users)
        print("Seeding complete! 🚀")

if __name__ == "__main__":
    main()

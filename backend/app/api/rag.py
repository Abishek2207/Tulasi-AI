from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
import json
from app.core.database import get_session
from app.api.auth import get_admin_user
from app.models.models import User, UserMemoryChunk
from app.services.vector_service import vector_service

router = APIRouter()

# ── Expanded Knowledge Base ───────────────────────────────────────────────────

SYSTEM_DESIGN_SEED = [
    "Q: How do you design a scalable Twitter feed? A: Use a combination of push and pull models. Push to active users via fanout service (Redis or Cassandra), and pull for celebrities with massive followers to avoid fanout latency. Use CDN for media delivery.",
    "Q: What is a Bloom filter and when to use it? A: A space-efficient probabilistic data structure to test set membership. Used in databases like Cassandra to avoid expensive disk lookups for non-existent keys. Has false positives but never false negatives.",
    "Q: Contrast monolithic architectures vs microservices. A: Monoliths are simpler to deploy and debug initially but scale poorly. Microservices allow independent scaling, language flexibility, and targeted fault isolation but introduce network latency and distributed data consistency challenges.",
    "Q: What is the CAP theorem? A: A distributed data store can only guarantee two out of three: Consistency, Availability, and Partition tolerance. In a network partition, you must choose between C and A.",
    "Q: How do you design a URL shortener like bit.ly? A: Use Base62 encoding (a-z, A-Z, 0-9) to generate 7-char short codes. Store mapping in a NoSQL DB (DynamoDB) with the short code as the key. Use Redis to cache hot URLs. Handle collisions with retry logic or pre-generated code pools.",
    "Q: What is consistent hashing and why is it used? A: A technique to distribute data across nodes where only K/n keys need to be remapped when a node is added/removed (K=keys, n=nodes). Used in distributed caches (Memcached, Redis Cluster) to minimize rebalancing.",
    "Q: How would you design a rate limiter? A: Use token bucket (smooth bursts) or sliding window counter (strict). Store per-user counters in Redis with TTL. For distributed, use Redis Lua scripts for atomic operations. Apply at API Gateway layer.",
    "Q: How do you design a distributed message queue? A: Kafka uses partitioned logs for high-throughput ordered delivery. Producers write to partitions, consumers read at their own offset. Supports at-least-once delivery. Use consumer groups for parallel processing.",
    "Q: What is a CDN and when to use it? A: Content Delivery Network caches static assets (images, JS, CSS) at edge nodes close to users. Pull CDN fetches content on first request; Push CDN pre-uploads. Reduces latency by 60-80% for global users.",
    "Q: How do you design a notification system? A: Event producer → Message Queue (Kafka) → Notification Service → per-channel workers (Email/SMS/Push). Use retry logic with exponential backoff. Store notification history in Cassandra (time-series optimized).",
    "Q: What is database sharding? A: Horizontal partitioning of data across multiple DB instances. Shard key determines which shard stores a record. Horizontal sharding + consistent hashing minimizes hotspots. Be aware of cross-shard queries and transactions.",
    "Q: Explain ACID vs BASE properties. A: ACID (Atomicity, Consistency, Isolation, Durability) - traditional relational DBs. BASE (Basically Available, Soft state, Eventually consistent) - NoSQL DBs optimized for high availability and scale. Choose based on consistency requirements.",
    "Q: How would you design a global file storage like Google Drive? A: Chunk files into 4MB blocks. Each chunk has a hash (content-addressable). Store chunks in distributed object storage (S3). Metadata (file tree, permissions, versions) in a separate metadata service with Postgres/Spanner.",
    "Q: What is a circuit breaker pattern? A: Protects services from cascading failures. States: Closed (normal), Open (failing, reject requests immediately), Half-Open (testing recovery). Implemented in Hystrix, Resilience4j. Prevents overloading a failing downstream service.",
    "Q: How do you handle database replication lag? A: Use read-after-write consistency (route same user's reads to the same replica). Use sticky sessions or read from primary for critical reads. Monitor replication lag with alerting thresholds. Consider synchronous replication for financial systems.",
]

FAANG_INTERVIEW_SEED = [
    "Q: What is the STAR method for behavioral interviews? A: Situation (context/background), Task (your specific responsibility), Action (exactly what YOU did - use 'I' not 'We'), Result (quantified outcome). Example: 'Reduced API latency by 40% (Result) by implementing Redis caching (Action) when our checkout service was failing under load (Situation) and I was the backend lead (Task).'",
    "Q: How to handle conflicts in a software team? A: Emphasize open communication, assuming good intent, using data-driven arguments over opinions. Present trade-offs objectively. Escalate to a manager only when a deadlock persists. Show ownership and follow-up.",
    "Q: Most common DSA patterns for FAANG interviews? A: Two Pointers (sorted arrays, palindromes), Sliding Window (subarray problems), Fast/Slow Pointers (cycle detection), BFS/DFS (tree/graph traversal), Dynamic Programming (overlapping subproblems), Binary Search (sorted arrays), Heap (top-k elements), Backtracking (permutations/combinations).",
    "Q: What is the two-pointer technique? A: Use two indices (left and right) to search for a pair satisfying a condition. Useful for sorted arrays (Two Sum II), removing duplicates, container with most water. Time O(n) vs O(n^2) brute force.",
    "Q: Explain dynamic programming vs recursion. A: Recursion solves subproblems but may recompute them. DP stores results (memoization = top-down, tabulation = bottom-up) to avoid redundant work. Key: overlapping subproblems + optimal substructure. Example: Fibonacci, Knapsack, Coin Change.",
    "Q: How do you approach a coding problem in an interview? A: (1) Clarify constraints (input size, edge cases, output format). (2) Think aloud with a brute force first. (3) Identify bottleneck and optimize. (4) Write clean code with meaningful variable names. (5) Test with edge cases (empty, single element, negative numbers).",
    "Q: What is a HashSet vs HashMap? A: HashSet stores unique keys only (no values), backed by a HashMap internally. HashMap stores key-value pairs. Both O(1) avg for insert/lookup/delete. Use HashSet for duplicate detection, HashMap for counting/mapping.",
    "Q: When should you use a Stack vs Queue? A: Stack (LIFO) - for DFS traversal, undo operations, balanced parentheses. Queue (FIFO) - for BFS traversal, task scheduling, print spooling. Both O(1) for push/pop/enqueue/dequeue.",
]

ROADMAP_SEED = [
    "Learning Path for AI/ML Engineer: Month 1-2 Python + Math (Linear Algebra, Calculus, Statistics). Month 3-4: Scikit-learn, Pandas, Matplotlib. Month 5-6: Deep Learning with PyTorch (CNNs, RNNs, Transformers). Month 7-9: LLM fine-tuning, RAG systems, Vector DBs. Month 10-12: Production ML (MLOps, Docker, FastAPI serving). Target: ML Engineer at MNC or startup.",
    "Learning Path for Full Stack Developer: Month 1 HTML/CSS/JavaScript fundamentals. Month 2 React.js + Node.js. Month 3 Database (PostgreSQL + MongoDB). Month 4 Docker + REST APIs + Authentication. Month 5 TypeScript + Testing + CI/CD. Month 6 System Design basics + Cloud deployment. Portfolio: 3 full-stack projects with auth, DB, and deployment.",
    "Learning Path for Backend Engineer: Month 1 Python/Java + OOP. Month 2 Data Structures + Algorithms (Neetcode 150). Month 3 Databases (SQL + indexing + transactions). Month 4 System Design (REST APIs, caching, load balancing). Month 5 Microservices + Docker + Kubernetes basics. Month 6 Interview prep + system design mock interviews.",
    "Learning Path for DevOps Engineer: Month 1-2 Linux fundamentals + Shell Scripting + Git. Month 3 Docker + Container orchestration. Month 4 Kubernetes (deployment, services, ingress). Month 5 CI/CD pipelines (GitHub Actions, Jenkins). Month 6 Cloud (AWS/GCP) + Terraform IaC. Key certifications: CKA, AWS Solutions Architect Associate.",
    "1st Year Student Roadmap: Focus on programming fundamentals — master one language (Python recommended), basic math (discrete maths + statistics), and build 2 simple projects. Join college hackathons. Don't jump to advanced topics.",
    "2nd Year Student Roadmap: DSA with Neetcode 150, contribute to 1 open source project, build a web app with a backend API, apply to summer internships by December. Intro to system design concepts.",
    "3rd Year Student Roadmap: Advance DSA to 300+ problems, system design (URL shortener + Twitter feed), apply aggressively to internships, build a capstone 3-month project, start mock interviews in December.",
    "4th Year Placement Strategy: By August complete 300+ LeetCode, by September have 3 portfolio projects, by October start mock interview loops, by November apply to 50+ companies, negotiate all offers simultaneously. Don't sign early.",
]

ALL_KNOWLEDGE = SYSTEM_DESIGN_SEED + FAANG_INTERVIEW_SEED + ROADMAP_SEED


@router.post("/seed")
def seed_global_knowledge(
    db: Session = Depends(get_session),
    admin: User = Depends(get_admin_user),
):
    """
    Seeds the RAG vector store with foundational AI Career Platform knowledge.
    Global knowledge is assigned to user_id = 0.
    """
    try:
        existing = db.exec(
            select(UserMemoryChunk).where(UserMemoryChunk.user_id == 0)
        ).first()
        if existing:
            return {"message": f"Knowledge already seeded ({len(ALL_KNOWLEDGE)} entries)"}

        vector_service.store_batch_embeddings(user_id=0, texts=ALL_KNOWLEDGE, db=db)
        return {
            "message": f"Successfully seeded {len(ALL_KNOWLEDGE)} knowledge chunks into RAG memory.",
            "breakdown": {
                "system_design": len(SYSTEM_DESIGN_SEED),
                "interview": len(FAANG_INTERVIEW_SEED),
                "roadmaps": len(ROADMAP_SEED),
            },
        }
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return {"error": str(e)}


@router.post("/reseed")
def reseed_global_knowledge(
    db: Session = Depends(get_session),
    admin: User = Depends(get_admin_user),
):
    """Force re-seed: delete all global (user_id=0) chunks and re-populate."""
    try:
        existing = db.exec(
            select(UserMemoryChunk).where(UserMemoryChunk.user_id == 0)
        ).all()
        for chunk in existing:
            db.delete(chunk)
        db.commit()
        vector_service.store_batch_embeddings(user_id=0, texts=ALL_KNOWLEDGE, db=db)
        return {
            "message": f"Re-seeded {len(ALL_KNOWLEDGE)} knowledge chunks successfully.",
        }
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return {"error": str(e)}


@router.get("/query")
def query_knowledge(q: str, db: Session = Depends(get_session)):
    """Publicly query the global RAG (user_id=0)."""
    context = vector_service.retrieve_context(user_id=0, query=q, db=db, top_k=3)
    return {"query": q, "context": context}

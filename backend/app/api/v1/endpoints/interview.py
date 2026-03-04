from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class InterviewStartRequest(BaseModel):
    role: str

class EvaluateRequest(BaseModel):
    role: str
    question: str
    answer: str

class EvaluateResponse(BaseModel):
    score: int
    feedback: str

# 30+ Real MAANG & Top Tier MNC Interview Questions
QUESTION_BANK: dict[str, list[str]] = {
    "Frontend Developer": [
        "How would you design a highly scalable and performant autocomplete widget? (Google)",
        "Explain the tradeoff between Server-Side Rendering (SSR) and Client-Side Rendering (CSR). When would you choose which? (Meta)",
        "How does React's concurrent mode and suspense work under the hood? (Netflix)",
        "Describe how you would optimize a web application that is loading slowly on throttling 3G networks. (Amazon)",
        "Explain event delegation and event bubbling in JavaScript. (Apple)",
        "Design the frontend architecture for Netflix's video playback page.",
        "How do you handle state management in a large React application? Compare Context vs Redux.",
        "What are web workers and how would you use them to keep the UI thread unblocked?",
        "Explain CSS Grid vs Flexbox. In what scenario is Grid strictly better?",
        "How do you implement virtual scrolling for a list of 100,000 items? (Meta)"
    ],
    "Backend Developer": [
        "Design a URL shortening service like bit.ly. How do you handle high read throughput and concurrent writes? (Google)",
        "Explain how consistent hashing works and why it is used in distributed caching. (Amazon)",
        "How do you achieve exactly-once message processing in a distributed system like Kafka? (Netflix)",
        "What is the CAP theorem? How does it apply to Cassandra vs PostgreSQL? (Meta)",
        "Design a rate limiter that can handle millions of requests per second. (Stripe)",
        "Explain database transaction isolation levels and how they prevent dirty reads and phantom reads.",
        "How would you design a leaderboard system for a massive multiplayer game? (Apple)",
        "What happens behind the scenes when you type a URL into a browser until the page renders?",
        "Explain the Saga pattern vs Two-Phase Commit for distributed transactions.",
        "How do you optimize a slow PostgreSQL query? Walk through your debugging steps."
    ],
    "AI/ML Engineer": [
        "Explain the attention mechanism in Transformers. How does self-attention differ from cross-attention? (Google)",
        "How do you handle class imbalance in a dataset when training a deep learning model? (Meta)",
        "Describe the architecture of a Retrieval-Augmented Generation (RAG) system and its failure modes. (OpenAI)",
        "How do you deploy and serve a large language model (LLM) with low latency? (Amazon)",
        "Explain the tradeoff between bias and variance. How do regularization techniques affect this? (Apple)",
        "What is RLHF (Reinforcement Learning from Human Feedback) and how is it used to align LLMs?",
        "How would you optimize matrix multiplications for neural networks on GPU architecture? (NVIDIA)",
        "Explain the difference between L1 and L2 regularization and their impact on model weights.",
        "Design a real-time recommendation system for an e-commerce platform. (Amazon)",
        "What are the vanishing and exploding gradient problems? How do LSTMs and ResNets solve them?"
    ],
}

# Keywords expected in top-tier answers
MAANG_KEYWORDS = {
    "Frontend Developer": ["virtual dom", "memoization", "debouncing", "throttling", "server-side rendering", "hydration", "accessibility", "web vitals", "service worker", "virtualization", "lazy loading", "closure", "event loop", "microtasks"],
    "Backend Developer": ["scalability", "load balancer", "sharding", "consistent hashing", "rate limiting", "cap theorem", "acid", "transactions", "microservices", "caching", "idempotency", "throughput", "latency", "message queue", "kafka"],
    "AI/ML Engineer": ["transformer", "attention", "gradient descent", "backpropagation", "regularization", "overfitting", "embeddings", "vector database", "fine-tuning", "rlhf", "latency", "quantization", "rag", "cosine similarity"],
}

@router.post("/start")
async def start_interview(request: InterviewStartRequest):
    """Return MAANG/MNC questions for the selected role."""
    questions = QUESTION_BANK.get(request.role, QUESTION_BANK.get("Backend Developer", []))
    import random
    # Select 5 random questions
    selected_questions = random.sample(questions, 5)
    return {"role": request.role, "questions": selected_questions}

@router.post("/evaluate", response_model=EvaluateResponse)
async def evaluate_answer(request: EvaluateRequest):
    """
    Evaluate an interview answer based on MAANG standards.
    Uses robust heuristic scoring checking for industry keywords.
    """
    word_count = len(request.answer.strip().split())
    answer_lower = request.answer.lower()
    
    # 1. Base score on detail and depth
    if word_count < 15:
        base_score = 3
        feedback_base = "Your answer is too brief for a top-tier interview. You must elaborate with examples, tradeoffs, and deep technical details."
    elif word_count < 40:
        base_score = 5
        feedback_base = "A decent high-level overview, but lacking the technical depth expected at MAANG. Dive deeper into the architecture or underlying mechanisms."
    elif word_count < 80:
        base_score = 7
        feedback_base = "Strong answer with good detail. To push it higher, discuss edge cases, scalability tradeoffs, or real-world constraints."
    else:
        base_score = 8
        feedback_base = "Excellent, thorough answer! You demonstrated solid depth and context."
    
    # 2. Keyword matching for the specific role
    expected_keywords = MAANG_KEYWORDS.get(request.role, MAANG_KEYWORDS["Backend Developer"])
    found_keywords = [kw for kw in expected_keywords if kw in answer_lower]
    
    keyword_bonus = min(2, len(found_keywords) * 0.5)
    
    # 3. Structural checks (e.g. mentions tradeoffs / alternatives)
    structure_bonus = 0
    if any(word in answer_lower for word in ["tradeoff", "however", "on the other hand", "alternatively", "bottleneck", "scale"]):
        structure_bonus = 1
        feedback_base += " Great job discussing tradeoffs and alternatives—interviewers love that."

    # Final Score Calculation
    final_score = int(min(10, base_score + keyword_bonus + structure_bonus))
    
    if len(found_keywords) < 2 and final_score < 7:
        feedback_base += f" Try incorporating industry standard concepts like '{expected_keywords[0]}' or '{expected_keywords[1]}'."

    return EvaluateResponse(score=final_score, feedback=feedback_base)

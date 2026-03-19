# Tulasi AI — Complete Architecture Blueprint

## 1. Complete System Architecture

Tulasi AI is built on a modern, decoupled microservices-inspired architecture designed for high scalability and zero infrastructure cost.

**Architecture Layers:**
1. **Client Layer:** Next.js 14 App Router (React) deployed on Vercel.
2. **API/Business Logic Layer:** FastAPI (Python) backend to handle intensive AI data processing, web sockets, and RAG execution, deployed on Railway.
3. **AI Execution Layer:** LangChain + Ollama (running local LLMs) to process RAG and agentic workflows completely for free.
4. **Data Persistence Layer:** PostgreSQL (via Supabase or Neon DB) for relational data processing.
5. **Vector Store Layer:** ChromaDB (Open-source, self-hosted/local vector database) for storing document embeddings and enabling RAG queries.

## 2. Full Folder Structure

```text
TulasiAI/
├── frontend/                     # Next.js Application
│   ├── public/                   # Static assets, fonts, transparent logos
│   ├── src/
│   │   ├── app/                  # App Router (Pages & Layouts)
│   │   │   ├── (auth)/           # Login, Register
│   │   │   ├── (dashboard)/      # Chat, Profile, PDF Q&A, Practice, Reels, Roadmaps
│   │   │   └── api/              # Next.js API Routes (NextAuth, Webhooks)
│   │   ├── components/           # Reusable UI components (Sidebar, TopBar, Editor)
│   │   ├── lib/                  # Utility functions (Shadcn, Framer Motion variants)
│   │   └── store/                # Redux Toolkit (UI State, Chat State)
│   ├── next.config.mjs
│   ├── tailwind.config.ts
│   └── package.json
│
├── backend/                      # Python FastAPI Application
│   ├── app/
│   │   ├── api/                  # API Routers (auth, chat, code, pdf, messages, etc.)
│   │   ├── core/                 # Config, DB initialization, AI Router
│   │   ├── models/               # SQLModel schemas
│   │   ├── services/             # Business logic (Langchain bindings, Ollama clients)
│   │   └── ui/                   # Admin UI configurations if any
│   ├── data/                     # Local SQLite DB (Dev) & ChromaDB storage
│   ├── requirements.txt
│   ├── Dockerfile
│   └── main.py                   # FastAPI entry point
│
├── README.md
├── docker-compose.yml            # Local deployment (Backend + DB + ChromaDB)
└── ARCHITECTURE_BLUEPRINT.md
```

## 3. Database Schema

Built using **SQLModel** (SQLAlchemy + Pydantic) for PostgreSQL connectivity.

* **User**: `id`, `email`, `role`, `name`, `xp`, `streak`, `provider`
* **ChatMessage**: `id`, `session_id`, `user_id`, `role`, `content`, `created_at`
* **DirectMessage**: `id`, `sender_id`, `receiver_id`, `content`, `created_at`
* **Hackathon**: `id`, `name`, `organizer`, `deadline`, `tags`, `link`
* **Certificate**: `id`, `user_id`, `title`, `issuer`, `file_path`, `issued_at`
* **UserActivity**: `id`, `user_id`, `activity_type`, `points_awarded`, `created_at`
* **CodeSubmission**: `id`, `user_id`, `problem_id`, `language`, `status`, `execution_time`

## 4. Backend API Design

**Base URL**: `/api/v1`

* **Auth**: `/auth/register`, `/auth/login`, `/auth/me`
* **Chat**: `/chat` (POST message), `/chat/history/{session_id}` (GET)
* **Messages**: `/messages` (POST to send), `/messages/{user_id}` (GET conversation)
* **PDF Analysis**: `/pdf/upload` (POST), `/pdf/query/{doc_id}` (POST)
* **Code Environment**: `/code/execute` (POST code text to sandbox)
* **Hackathons**: `/hackathons?tag=web3` (GET)
* **Roadmaps**: `/roadmaps/{career_path}` (GET timeline)
* **Interview**: `/interview/start` (POST), `/interview/evaluate` (POST)

## 5. LangChain RAG Implementation

To keep the application entirely free:
1. **Embeddings:** Use `HuggingFaceEmbeddings` (e.g., `all-MiniLM-L6-v2`) via Langchain.
2. **Vector Store:** Use `ChromaDB` running in persistent local mode inside the Python container.
3. **Execution Pipeline:**
   ```python
   # pseudo-code concept
   from langchain_community.llms import Ollama
   from langchain.chains import ConversationalRetrievalChain
   from langchain_community.vectorstores import Chroma
   
   llm = Ollama(model="llama3")
   vectorstore = Chroma(persist_directory="./data/chroma", embedding_function=hf_embeddings)
   qa_chain = ConversationalRetrievalChain.from_llm(llm, vectorstore.as_retriever())
   ```

## 6. AI Agent Architecture

Instead of simple prompts, implement a **Supervisor Agent** (via LangGraph) that routes user queries:
* **Academic Query** -> Search VectorDB for textbook definitions.
* **Code Query** -> Route to "Coder Agent" capable of reading Monaco editor syntax.
* **Resume Query** -> Route to "Resume ATS Agent" that generates markdown responses scoring the resume.

## 7. UI Page Structure

* **`/`** - Landing page featuring animated hero and live chat demo.
* **`/auth`** - Dual-column layout (Left: brand imagery, Right: Google/Email login).
* **`/dashboard`** - Personalized home, daily streak trackers, roadmap overview.
* **`/dashboard/chat`** - Split screen (History sidebar, Chat window with Markdown/Syntax support).
* **`/dashboard/reels`** - Grid of embedded YouTube iframes with hover states.
* **`/dashboard/code`** - Split-pane layout (Left: Problem descriptions, Right: Monaco Editor + Console).

## 8. Landing Page Animation Plan

**Framer Motion Integration:**
* **Hero Text:** `initial={{ opacity: 0, y: 30 }}` to `animate={{ opacity: 1, y: 0 }}`. Staggered text reveal with `-3px` letter spacing.
* **Floating Logo:** Background glowing orb `scale: [1, 1.2, 1]` looping continuously. Center logo uses `drop-shadow` with dynamic rotation based on scroll (`useTransform`).
* **Feature Cards:** `whileHover={{ y: -10, scale: 1.02 }}` to create a tactile glassmorphism feel.

## 9. Deployment Instructions (Zero Cost)

1. **Database:** Create a free tier PostgreSQL database on Supabase or Neon.
2. **Backend:** 
   * Deploy to **Railway** Web Service. 
   * Pre-requisites: Bind to `$PORT`, set `DATABASE_URL` to Supabase connection string.
3. **Frontend:**
   * Import repository into **Vercel** (Free Tier).
   * Define `NEXT_PUBLIC_API_URL=[Railway URL]` and `NEXTAUTH_URL=[Vercel URL]`.
   * Enable CI/CD via GitHub.
4. **AI Models (Ollama):** 
   * *Challenge*: Running Ollama on Render's free tier is RAM restrictive. 
   * *Zero-Cost Solution*: Use Hugging Face Inference API (Free tier) or Groq API (extremely fast and generous free tier for Llama3) as the backend model engine until scaled.

## 10. GitHub Repository Setup

* Branch strictly separated into `main` (Production) and `develop` (Staging).
* Add GitHub Actions workflow (`.github/workflows/ci.yml`) to automatically lint Next.js and run `pytest` inside the Python environment before allowing PR merges.

## 11. Environment Variables Template

**.env (Backend)**
```
DATABASE_URL=postgresql://user:pass@db.supabase.co:5432/postgres
SECRET_KEY=long_random_jwt_secret
GROQ_API_KEY=gsk_free_key_for_llama3 # If substituting Ollama for Groq
ADMIN_EMAIL=admin@tulasiai.com
```

**.env.local (Frontend)**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=long_random_nextauth_secret
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
```

## 12. Docker Setup

Provide a minimal `docker-compose.yml` for unified local setup:
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports: ["8000:8000"]
    volumes: ["./backend:/app"]
    env_file: ["./backend/.env"]
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    volumes: ["./frontend:/app"]
    env_file: ["./frontend/.env.local"]
```

## 13. Security Strategy

* **Auth:** NextAuth.js managing secure HTTP-only cookies; backend validates JWT headers on `Depends(get_current_user)`.
* **Rate Limiting:** Protect `/chat`, `/code/execute`, and `/auth` routes using `slowapi` in FastAPI to prevent API abuse.
* **Sandboxing:** Do not execute raw user code on the backend hardware directly. Use `pyston` or send code execution to Judge0 (Open Source self-hosted/free tier API).

## 14. Error Handling System

* **Frontend:** Create generic `ErrorBoundary` wrapper components in Next.js. Use `toast` notifications for network failures.
* **Backend:** Implement a global FastAPI exception handler mapping raw DB errors / unhandled exceptions into standardized `{ "error": "code", "detail": "message" }` payloads so the frontend can display them elegantly.

## 15. Step-by-Step Development Roadmap

1. **Phase 1: Foundation (Done)** 
   Complete Repo layout, Auth UI, PostgreSQL modeling, JWT, Sidebar/TopBar setup.
2. **Phase 2: RAG & Chat Intelligence** 
   Implement ChromaDB, Langchain chains, tie them to PDF uploads and the persistent Chat DB.
3. **Phase 3: Coding & Gamification** 
   Integrate Monaco Editor component. Build daily streak calculators in the UI layout handler.
4. **Phase 4: Community & DMs (In Progress)** 
   Polishing the `/messages` UI component and polling system, migrating to Socket.io later for instantaneous WebSockets.
5. **Phase 5: Hackathons & Roadmaps** 
   Fleshing out dynamic data scraping or manual DB entry structures for external content.
6. **Phase 6: CI/CD & Deploy** 
   Wire Vercel and Render endpoints, run final integration tests, publish `tulasi.ai`.

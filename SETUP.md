# Tulasi AI - Local Setup Instructions

Welcome to the Tulasi AI project repository. This guide will help you set up the full-stack AI SaaS education platform on your local machine.

## Prerequisites
- Node.js (v18 or higher)
- Python (v3.10 or higher)
- Git

## 1. Clone the Repository
```bash
git clone <your-repo-url>
cd tulasi-ai
```

## 2. Backend Setup (FastAPI & LangChain)
The backend uses Python, FastAPI, and LangChain for AI routing.

```bash
# Navigate to the backend folder
cd backend

# Create and activate a Virtual Environment
python -m venv venv
.\venv\Scripts\activate  # Windows
# source venv/bin/activate # Mac/Linux

# Install all required ML and API packages
pip install -r requirements.txt

# Environment Setup
# Edit `.env` file and insert your API keys
# GROQ_API_KEY=your_key
# GEMINI_API_KEY=your_key
# SECRET_KEY=your_development_secret_key

# Run the backend locally
uvicorn app.main:app --reload --port 8000
```
Swagger API docs will be accessible at: `http://localhost:8000/docs`

## 3. Frontend Setup (Next.js 14)
The frontend uses Next.js App Router, Tailwind CSS, Shadcn UI, and Redux.

```bash
# Open a new terminal and navigate to the frontend folder
cd frontend

# Install dependencies
npm install

# Environment Setup
# Edit `.env.local` to configure NextAuth and API URL
# NEXT_PUBLIC_API_URL=http://localhost:8000
# NEXTAUTH_URL=http://localhost:3000
# NEXTAUTH_SECRET=your_nextauth_secret

# Run the development server
npm run dev
```
The application will be accessible at `http://localhost:3000`.

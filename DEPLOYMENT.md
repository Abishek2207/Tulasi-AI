# Tulasi AI Production Deployment Checklist

Everything in the code is fully implemented to run beautifully on Vercel (Frontend) and Render's Free Tier (Backend). We replaced the memory-hungry vector database with a lightweight alternative.

## 1. Render Dashboard (Backend)
Go to [Render Dashboard](https://dashboard.render.com). Find your backend web service.
In the **Environment** tab, set these variables:

| Key | Value (Example) | Required |
|-----|-----------------|----------|
| `PYTHON_VERSION` | `3.10.13` | Yes |
| `GOOGLE_API_KEY` | `AIzaSyDGClF...` *(Your Gemini API key)* | Yes |
| `GROQ_API_KEY` | `gsk_...` | Optional (Fallback) |
| `SECRET_KEY` | *(Any long random string)* | Yes (for JWT Auth) |
| `ALGORITHM` | `HS256` | Yes |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `10080` | Yes |

*After setting these, go to the **Deploys** tab and click "Manual Deploy -> Deploy latest commit".*

## 2. Vercel Dashboard (Frontend)
Go to [Vercel Dashboard](https://vercel.com). Find the Tulasi AI project. 
In Settings -> Environment Variables, ensure these are set:

| Key | Value | Required |
|-----|-------|----------|
| `NEXT_PUBLIC_API_URL` | `https://tulasi-api.onrender.com` | Yes |
| `NEXT_PUBLIC_BACKEND_URL` | `https://tulasi-api.onrender.com` | Yes |
| `NEXTAUTH_URL` | `https://frontend-eight-tan-33.vercel.app` (or your domain) | Yes |
| `NEXTAUTH_SECRET` | *(Any long random string)* | Yes |
| `GOOGLE_CLIENT_ID` | `6607689850...` | Optional (For Google Auth) |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-...` | Optional (For Google Auth) |

## ✅ Completed Fixes
* **Memory Reduction**: Completely removed `chromadb` (which uses ~300MB RAM) and replaced it with `faiss-cpu` (under 10MB RAM). Render free tier will no longer OOM.
* **API Standardization**: Backend now strictly checks for `GOOGLE_API_KEY` to run Gemini.
* **Dependency Fixes**: Pinned all versions to stop pip dependency-resolution timeouts on Render.
* **NextAuth Google Login Fix**: Re-architected `[...nextauth]/route.ts` to *only* load Google/GitHub providers if the keys exist in the environment. This resolves the `?error=Configuration` loop you were seeing.
* **Central API Client**: Created `@/lib/api.ts` so the frontend reliably talks to Render. Connected the Chatbot UI to actually use the AI APIs.

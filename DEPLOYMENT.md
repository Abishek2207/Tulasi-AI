# Tulasi AI Production Deployment Guide

Due to a local Node.js environment error on your machine blocking the Cloudflare CLI, the best and most professional way to deploy SaaS platforms (which also sets up continuous CI/CD) is through GitHub. 

Follow these exact steps to get both your Frontend and Backend live for free!

## Step 1: Push to GitHub
First, we need your code in a repository.
1. Go to [GitHub.com](https://github.com) and create a **New Repository** called `tulasi-ai`.
2. Open your VS Code terminal and run these commands to push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/tulasi-ai.git
git branch -M main
git push -u origin main
```

*(Replace `YOUR_USERNAME` with your real GitHub username)*

## Step 2: Deploy Frontend to Vercel
Now we connect Vercel to your new GitHub repository.
1. Go to [Vercel.com](https://vercel.com/) and sign up/log in with your GitHub account.
2. Click **Add New...** -> **Project**.
3. Under "Import Git Repository", find your `tulasi-ai` repository and click **Import**.
4. Configure the project settings:
   - **Project Name:** `tulasi-ai`
   - **Framework Preset:** `Next.js` (Usually auto-detected)
   - **Root Directory:** Edit this and select `frontend` *(Important! Since your code is inside a subfolder)*
5. Expand the **Environment Variables** section and add:
   - Name: `NEXT_PUBLIC_SUPABASE_URL`, Value: (Your Supabase URL)
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`, Value: (Your Supabase Anon Key)
   - Name: `NEXT_PUBLIC_API_URL`, Value: (We will update this after deploying the backend)
6. Click **Deploy**. Vercel will now build and host your site!

## Step 3: Deploy Backend to Render
1. Go to the [Render Dashboard](https://dashboard.render.com/) and log in (Create an account using GitHub if needed).
2. Go to the **Blueprints** page.
3. Click **New Blueprint Instance** and connect your `tulasi-ai` GitHub repository.
4. Render will automatically detect the `render.yaml` file I created in your project root!
5. It will automatically provision the FastAPI Web Service.
6. Once it says "Live", click on your Web Service to copy the backend URL (e.g., `https://tulasi-backend-xxxx.onrender.com`).

## Step 4: Final Connection
1. Go back to your Vercel Dashboard for `tulasi-ai`.
2. Go to **Settings** -> **Environment Variables**.
3. Edit the `NEXT_PUBLIC_API_URL` and paste your new Render backend URL.
4. Go to the **Deployments** tab, click the three dots on your latest deployment, and select **Redeploy** to rebuild the frontend with the active backend URL.

🎉 **You are live!** Your platform is now publicly accessible with continuous deployment (meaning every time you push to GitHub, it updates automatically!).

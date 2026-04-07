# Resolving Google OAuth Error 400 & Deployment Configuration

Your frontend is officially hosted at: **https://tulasiai.in**

To connect everything securely and fix all lingering issues, you **MUST** do the following two things outside of the code editor:

## 1. Fix Google Cloud Console (OAuth)
The error `redirect_uri_mismatch` happens because Google only allows logins from pre-registered URLs.
1. Go to the [Google Cloud Console Credentials Page](https://console.cloud.google.com/apis/credentials).
2. Click on your **OAuth 2.0 Client ID**.
3. Scroll down to the **Authorized redirect URIs** section.
4. **DELETE** all old Vercel URLs.
5. **ADD** exactly this URL:
   ```text
   https://tulasiai.in/api/auth/callback/google
   ```
6. Click **Save**.

## 2. Fix Vercel Environment Variables
Vercel does **NOT** read your local `.env.local` file. You must manually add these to your Vercel Project Settings!
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click your `Tulasi-AI` project.
2. Go to **Settings > Environment Variables**.
3. Add the following variables:

| Key | Value |
| :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://tulasi-ai-wgwl.onrender.com` |
| `NEXTAUTH_URL` | `https://tulasiai.in` |
| `NEXTAUTH_SECRET` | `9fKxP2vQ7Zt8Lw3NmR5uY1aBcDeFgHiJkLmNoPqRsTu=` |
| `GOOGLE_ID` | *(Copy from your local .env.local)* |
| `GOOGLE_SECRET` | *(Copy from your local .env.local)* |

4. After saving these variables in Vercel, you **MUST TRIGGER A NEW DEPLOYMENT** (Click Deployments > Redeploy).

Once you do these two steps, the entire application will seamlessly connect to `https://tulasiai.in` without any API or Login failures!

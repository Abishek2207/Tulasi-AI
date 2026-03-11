# Resolving Google OAuth Error 400: redirect_uri_mismatch

The error you're seeing (`redirect_uri_mismatch`) happens because Google's security only allows logins from specific, pre-registered URLs.

Right now, your Google Cloud Console probably only allows `localhost:3000`.

## How to Fix It:

1. Go to the [Google Cloud Console Credentials Page](https://console.cloud.google.com/apis/credentials).
2. Click on your **OAuth 2.0 Client ID** (the one you used to get your Client ID and Secret).
3. Scroll down to the **Authorized redirect URIs** section.
4. Add the following exact URL:
   ```text
   https://tulasiai-nqt31yxx8-abisheks-projects-ad8e5054.vercel.app/api/auth/callback/google
   ```
5. *(Optional but recommended)* Also add your main production domain if you haven't yet:
   ```text
   https://frontend-eight-tan-33.vercel.app/api/auth/callback/google
   https://tulasiai.vercel.app/api/auth/callback/google
   ```
6. Click **Save** at the bottom.

> **Note**: Google says it can take "up to 5 minutes" for changes to take effect, but it usually works within a few seconds!

Once you click save, try logging in again — it will work perfectly!

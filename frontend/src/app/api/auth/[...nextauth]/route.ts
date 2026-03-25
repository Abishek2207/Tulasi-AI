import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";

const ADMIN_EMAIL = "admin@tulasi.ai";

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Email",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });
        if (!res.ok) return null;
        const data = await res.json();
        return {
          id: String(data.user.id),
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          accessToken: data.access_token,
          inviteCode: data.user.invite_code,
        };
      } catch {
        return null;
      }
    },
  }),
];

// Only add Google provider when credentials are present
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    })
  );
}

// Only add GitHub provider when credentials are present
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.push(
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  callbacks: {
    async signIn({ user, account }) {
      // For OAuth providers (Google/GitHub), register/login with FastAPI backend
      // and store the backend JWT in user.accessToken so it flows into the JWT token
      if (account && account.provider !== "credentials") {
        const BACKEND = process.env.NEXT_PUBLIC_API_URL || "https://tulasiai.up.railway.app";
        try {
          const res = await fetch(`${BACKEND}/api/auth/google-oauth`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              name: user.name || user.email?.split("@")[0],
              provider: account.provider,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            // Store the backend JWT on user so jwt() callback can pick it up
            if (data.access_token) {
              (user as unknown as Record<string, unknown>).accessToken = data.access_token;
            }
          }
        } catch (e) {
          console.error("OAuth backend sync failed:", e);
          // Still allow sign in even if backend sync fails
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      const u = user as unknown as Record<string, unknown>;
      if (user) {
        token.role = u.role as string || (user.email === ADMIN_EMAIL ? "admin" : "student");
        if (u.accessToken) {
          token.accessToken = u.accessToken as string;
        }
        if (u.inviteCode) {
          token.inviteCode = u.inviteCode as string;
        }
      }
      // OAuth providers — auto-assign role
      if (account && account.provider !== "credentials") {
        token.role = token.email === ADMIN_EMAIL ? "admin" : "student";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.accessToken = token.accessToken as string;
        session.user.inviteCode = token.inviteCode as string;
      }
      return session;
    },
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? `__Secure-next-auth.session-token` : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production"
      }
    }
  },
  pages: {
    signIn: "/auth",
    error: "/auth",
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

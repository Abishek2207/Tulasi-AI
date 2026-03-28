/**
 * Central API client for Tulasi AI backend.
 * Usage: import { api } from "@/lib/api"
 */

const isBrowser = typeof window !== "undefined";
const isDev = process.env.NODE_ENV === "development";
import toast from "react-hot-toast";

// ─── API Base URL ─────────────────────────────────────────────────────────────
// Env var is baked in at Vercel build time; fallback ensures local dev always works.
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://tulasi-ai-wgwl.onrender.com";

/** Centralised debug logger — always prints in dev; silent in prod unless token missing */
function log(label: string, data?: unknown) {
  if (isDev) {
    console.log(`[TulasiAPI] ${label}`, data ?? "");
  }
}

/** Resolve token EXCLUSIVELY from localStorage */
function resolveToken(): string | undefined {
  if (isBrowser) {
    const stored = localStorage.getItem("token");
    if (stored) return stored;
    
    const path = window.location.pathname;
    if (!path.startsWith("/auth") && path !== "/") {
      window.location.href = "/auth";
    }
  }
  return undefined;
}

/** Build a WebSocket URL pointing at the correct host (wss in production, ws locally) */
export function websocketUrl(path: string): string {
  if (!isBrowser) return "";
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = new URL(API_URL).host;
  return `${protocol}//${host}${path}`;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const FETCH_TIMEOUT_MS = 60_000; // 60s timeout for AI endpoints

async function fetchWithRetry(url: string, options: RequestInit, retries = 2): Promise<Response> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);

    if (!res.ok) {
      if (res.status === 502 || res.status === 503 || res.status === 504) {
         if (retries === 2) toast.loading("Server waking up. Retrying...", { id: "retry-toast" }); 
         throw new Error("API error / Server waking up");
      }
      if (res.status >= 500) {
         throw new Error(`API error: ${res.status}`);
      }
      return res; // return early for 4xx errors
    }
    toast.dismiss("retry-toast");
    return res;
  } catch (err: unknown) {
    const error = err as Error;
    if (retries === 0 || error.name === 'AbortError') {
      toast.dismiss("retry-toast");
      if (error.name === 'AbortError') {
        throw new Error("Request timed out.");
      }
      throw error;
    }
    // Exponential backoff for the 2 retries
    await new Promise(r => setTimeout(r, 1000 * (3 - retries)));
    return fetchWithRetry(url, options, retries - 1);
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  ignoredToken?: string
): Promise<T> {
  const token = resolveToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const fullUrl = `${API_URL}${path}`;

    try {
      // We use Bearer token headers for auth — cookies are not needed.
      // Using 'omit' removes the CORS preflight restriction entirely.
      const res = await fetchWithRetry(fullUrl, { credentials: "omit", ...options, headers, mode: "cors" });
      log(`← ${res.status} ${fullUrl}`);

    if (!res.ok) {
      if (res.status === 401) {
        if (isBrowser && !window.location.pathname.startsWith("/auth")) {
          window.location.href = "/auth";
        }
        throw new Error("Session expired. Please log in again.");
      }
      
      let backendMsg = res.statusText;
      try {
        const errJson = await res.json();
        backendMsg = errJson.detail || errJson.message || errJson.error || backendMsg;
      } catch (e) {}
      
      if (res.status >= 500) throw new Error(`500 Server Error: ${backendMsg}`);
      throw new Error(backendMsg || `Request failed: ${res.status}`);
    }
    const data = await res.json();
    
    // XP toast — cinematographic
    if (data && typeof data === "object" && typeof data.xp_earned === "number" && data.xp_earned > 0) {
      import("@/components/XPNotification").then(mod => {
        mod.showXPGain(data.xp_earned, data.xp_reason || "Learning Milestone");
      });
    }
    
    return data;
  } catch (err: unknown) {
    const error = err as Error;
    const msg = error.message || "Network Error";
    if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("ERR_NAME_NOT_RESOLVED")) {
      throw new Error("Backend unreachable. Check your connection.");
    }
    throw new Error(msg);
  }
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (email: string, password: string, name: string, invite_code?: string) =>
    request<{ access_token: string; user: User }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name, invite_code }),
    }),

  login: (email: string, password: string) =>
    request<{ access_token: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: (token: string) =>
    request<User & { invite_code: string }>("/api/auth/me", {}, token),
};

// ─── Chat ────────────────────────────────────────────────────────────────────

export const chatApi = {
  send: async (message: string, session_id?: string, tool?: string) => {
    let retries = 2;
    while (retries >= 0) {
      try {
        return await request<{ response: string; session_id?: string; model_used?: string }>(
          "/api/chat",
          { method: "POST", body: JSON.stringify({ message, session_id, tool }) }
        );
      } catch (err) {
        if (retries === 0) throw err;
        retries--;
        await new Promise(r => setTimeout(r, 2000)); // 2 sec delay
      }
    }
    throw new Error("Chat send failed after retries.");
  },

  feedback: (session_id: string, message_id: string, rating: number) =>
    request<{ status: string }>("/api/chat/feedback", {
      method: "POST",
      body: JSON.stringify({ session_id, message_id, rating }),
    }),

  history: (session_id: string) =>
    request<{ messages: ChatMsg[]; session_id: string }>(
      `/api/chat/history/${session_id}`,
      {}
    ),

  clearHistory: (session_id: string) =>
    request<{ message: string }>(`/api/chat/history/${session_id}`, { method: "DELETE" }),

  sessions: () =>
    request<{ sessions: ChatSession[] }>("/api/chat/sessions"),
};


// ─── Roadmap ─────────────────────────────────────────────────────────────────

export const roadmapApi = {
  getRoadmaps: (token: string) => request<{ roadmaps: Roadmap[], completed_milestones: string[] }>("/api/roadmap/", {}, token),
  getRoadmap: (id: string, token: string) => request<Roadmap>(`/api/roadmap/${id}`, {}, token),
  logProgress: (roadmap_id: string, milestone_id: string, token: string) =>
    request<{ message: string; xp_earned: number }>("/api/roadmap/progress", {
      method: "POST",
      body: JSON.stringify({ roadmap_id, milestone_id }),
    }, token),
  generate: (goal: string, token: string) =>
    request<{ roadmap: Roadmap }>("/api/roadmap/generate", {
      method: "POST",
      body: JSON.stringify({ goal }),
    }, token),
};

// ─── Interview ───────────────────────────────────────────────────────────────

export const interviewApi = {
  start: (role: string, company: string = "Any Company", interview_type: string = "Technical", token: string) =>
    request<{ question: string; session_id: string; total_questions: number; question_number: number }>("/api/interview/start", {
      method: "POST",
      body: JSON.stringify({ role, company, interview_type }),
    }, token),

  answer: (answer: string, session_id: string, token: string) =>
    request<{ feedback: string; score: number; next_question?: string }>(
      "/api/interview/answer",
      { method: "POST", body: JSON.stringify({ answer, session_id }) },
      token
    ),
};

// ─── Hackathons ──────────────────────────────────────────────────────────────

export const hackathonApi = {
  list: (tag?: string, status?: string, token?: string) => {
    const params = new URLSearchParams();
    if (tag) params.append("tag", tag);
    if (status) params.append("status", status);
    return request<{ hackathons: Hackathon[]; total: number }>(`/api/hackathons?${params.toString()}`, {}, token);
  },
  get: (id: number, token?: string) => request<Hackathon>(`/api/hackathons/${id}`, {}, token),
  create: (data: Partial<Hackathon>, token: string) =>
    request<Hackathon>("/api/hackathons", {
      method: "POST",
      body: JSON.stringify(data),
    }, token),
  bookmark: (id: number, token: string) =>
    request<Hackathon>(`/api/hackathons/${id}/bookmark`, { method: "POST" }, token),
  unbookmark: (id: number, token: string) =>
    request<Hackathon>(`/api/hackathons/${id}/bookmark`, { method: "DELETE" }, token),
  bookmarked: (token: string) =>
    request<{ hackathons: Hackathon[] }>("/api/hackathons/bookmarked", {}, token),
};

// ─── Study Rooms ─────────────────────────────────────────────────────────────

export const studyApi = {
  rooms: () => request<{ rooms: StudyRoom[] }>("/api/study/rooms"),
  create: (data: Partial<StudyRoom>, token: string) =>
    request<StudyRoom>("/api/study/create", { method: "POST", body: JSON.stringify(data) }, token),
  join: (roomId: number | string, token: string) =>
    request<StudyRoom>(`/api/study/join/${roomId}`, { method: "POST" }, token),
  messages: (roomId: number | string, token: string, limit = 50) =>
    request<{ room_id: number; room_name: string; messages: StudyMessage[] }>(`/api/study/${roomId}/messages?limit=${limit}`, {}, token),
  sendMessage: (roomId: number | string, content: string, token: string) =>
    request<StudyMessage>(`/api/study/${roomId}/messages`, { method: "POST", body: JSON.stringify({ content }) }, token),
};

// ─── Code Practice ───────────────────────────────────────────────────────────

export const codeApi = {
  problems: (category?: string, difficulty?: string, search?: string, token?: string) => {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (difficulty) params.append("difficulty", difficulty);
    if (search) params.append("search", search);
    return request<{ problems: CodeProblem[]; categories: string[]; total: number; solved_count: number }>(`/api/code/problems?${params.toString()}`, {}, token);
  },
  getProblem: (id: string, token: string) => request<CodeProblem>(`/api/code/problems/${id}`, {}, token),
  markSolved: (id: string, token: string) =>
    request<{ success: boolean; newly_solved: boolean; problem_id: string; solved_count: number; progress_pct: number; xp_earned: number }>(`/api/code/problems/${id}/solve`, { method: "POST" }, token),
  run: (code: string, language: string, token: string, stdin?: string) =>
    request<{ stdout: string; stderr: string; output: string; status: string; execution_time_ms?: number }>("/api/code/run", { method: "POST", body: JSON.stringify({ code, language, stdin }) }, token),
  explain: (code: string, language: string, token: string) =>
    request<{ explanation: string; status: string }>("/api/code/explain", { method: "POST", body: JSON.stringify({ code, language }) }, token),
};

// ─── Auth / User ─────────────────────────────────────────────────────────────

// ─── Startup Lab ─────────────────────────────────────────────────────────────

export const startupApi = {
  generate: (domain: string, target_audience: string, token: string) =>
    request<{ status: string; idea: StartupIdea }>("/api/startup/generate", { method: "POST", body: JSON.stringify({ domain, target_audience }) }, token),
  save: (idea: Partial<StartupIdea>, token: string) =>
    request<{ message: string; id: number }>("/api/startup/save", { method: "POST", body: JSON.stringify(idea) }, token),
  ideas: (token: string) => request<{ ideas: StartupIdea[] }>("/api/startup/ideas", {}, token),
  generatePitchDeck: (data: { name: string; problem: string; solution: string; market_opportunity: string; monetization: string }, token: string) =>
    request<{ status: string; pitch_deck: string }>("/api/startup/pitch-deck", { method: "POST", body: JSON.stringify(data) }, token),
};

// ─── Certificates ────────────────────────────────────────────────────────────

export const certificateApi = {
  list: (token: string) => request<{ certificates: Certificate[], milestones: Milestone[] }>("/api/certificates/my", {}, token),
  generate: (milestoneId: string, token: string) => request<{ message: string }>(`/api/certificates/generate/${milestoneId}`, { method: "POST" }, token),
  uploadFile: async (file: File, title: string, token: string) => {
    const form = new FormData();
    form.append("file", file);
    form.append("title", title);
    const res = await fetchWithRetry(`${API_URL}/api/certificates/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (!res.ok) throw new Error((await res.json()).detail || "Upload failed");
    return res.json() as Promise<{ id: number; title: string; file_path: string }>;
  },
};

// ─── Resume Builder ──────────────────────────────────────────────────────────

export const resumeApi = {
  improve: (data: { resume_text: string, job_description: string, mode: string, document_type: string }, token: string) =>
    request<{ ats_score: number; readability_score: number; keyword_match_percent: number; feedback: string[]; missing_keywords: string[]; improved_resume: string }>("/api/resume/improve", {
      method: "POST",
      body: JSON.stringify(data),
    }, token),
  
  getHistory: (token: string) =>
    request<ResumeHistory[]>("/api/resume/history", {
      method: "GET",
    }, token),
};

// ─── Health Check ─────────────────────────────────────────────────────────────

/** Health check — uses the correct /api/health path (NOT /health) */
export const healthCheck = () =>
  request<{ status: string; server: string; version: string; services: string[]; uptime_seconds: number }>("/api/health");

// ─── Gamification & Activity ─────────────────────────────────────────────────

export const activityApi = {
  getStats: (token: string) => request<Record<string, unknown>>("/api/activity/stats", {}, token),
  getLeaderboard: (token?: string) => request<{ 
    leaderboard: LeaderboardUser[]; 
    user_context?: { rank: number; xp: number; streak: number; problems_solved: number; is_pro: boolean } 
  }>("/api/activity/leaderboard", {}, token),
  getAnalytics: (token: string) => request<{ time_series: AnalyticsSeries[], total_period_xp: number, total_period_problems: number }>("/api/activity/analytics", {}, token),
  getPublicFeed: () => request<{ feed: any[] }>("/api/activity/public-feed"),
};

// ─── Profile ─────────────────────────────────────────────────────────────────

export const profileApi = {
  update: (data: { name?: string; bio?: string; skills?: string }, token: string) =>
    request<{ message: string; user: User }>("/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }, token),
};

// ─── Group Chat ───────────────────────────────────────────────────────────────

export const groupApi = {
  list: (token: string) => request<{ groups: Group[] }>("/api/groups", {}, token),
  create: (name: string, description: string, token: string) =>
    request<Group>("/api/groups/create", {
      method: "POST",
      body: JSON.stringify({ name, description }),
    }, token),
  join: (join_code: string, token: string) =>
    request<{ message: string; group: Group }>("/api/groups/join", {
      method: "POST",
      body: JSON.stringify({ join_code }),
    }, token),
  getMessages: (groupId: number, token: string) =>
    request<{ group_id: number; messages: GroupMessage[] }>(`/api/groups/${groupId}/messages`, {}, token),
  sendMessage: (groupId: number, content: string, token: string, is_encrypted: boolean = false) =>
    request<GroupMessage>(`/api/groups/${groupId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content, is_encrypted }),
    }, token),
};

// ─── Rewards ─────────────────────────────────────────────────────────────────

export const rewardApi = {
  getRewards: (token: string) => request<{ rewards: Reward[] }>("/api/activity/rewards", {}, token),
  redeem: (reward_id: number, token: string) => 
    request<{ message: string; remaining_xp: number }>("/api/activity/rewards/redeem", {
      method: "POST",
      body: JSON.stringify({ reward_id })
    }, token)
};

// ─── Payment (Razorpay) ──────────────────────────────────────────────────────

export const paymentApi = {
  /**
   * Create a Razorpay order on the backend.
   * Returns order_id, amount (in paise), currency, and the public key_id.
   */
  createOrder: () =>
    request<{ order_id: string; amount: number; currency: string; key_id: string }>(
      "/api/payment/create-order",
      { method: "POST" }
    ),

  /**
   * Verify Razorpay payment signature on the backend.
   * Backend checks HMAC-SHA256 and sets is_pro = true on success.
   */
  verifyPayment: (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) =>
    request<{ success: boolean; message: string; is_pro: boolean }>(
      "/api/payment/verify",
      { method: "POST", body: JSON.stringify(data) }
    ),

  /** Get current user's Pro status */
  getStatus: () =>
    request<{ user_id: number; email: string; is_pro: boolean; plan: string }>(
      "/api/payment/status"
    ),
};

// ─── Reviews ─────────────────────────────────────────────────────────────────

export interface ReviewItem {
  id: number;
  name: string;
  role?: string;
  review: string;
  rating: number;
  created_at: string;
}

export const reviewsApi = {
  getReviews: () => request<ReviewItem[]>("/api/reviews"),
  submitReview: (data: { name: string; role?: string; review: string; rating: number }) =>
    request<ReviewItem>("/api/reviews", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ─── Types ───────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  email: string;
  name: string;
  role: "student" | "admin";
  avatar?: string;
  streak?: number;
  xp?: number;
  level?: number;
  invite_code?: string;
  is_pro?: boolean;
}

export interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

export interface ChatSession {
  session_id: string;
  title: string;
  last_active: string;
}

export interface Hackathon {
  id: number;
  title: string;
  date: string;
  location?: string;
  tags?: string[];
  [key: string]: string | number | boolean | string[] | undefined | null;
}

export interface StudyRoom {
  id: number;
  name: string;
  topic?: string;
  [key: string]: string | number | boolean | undefined | null;
}

export interface StudyMessage {
  id: number;
  user_name: string;
  content: string;
  created_at: string;
  [key: string]: string | number | boolean | undefined | null;
}

export interface CodeProblem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  [key: string]: string | number | boolean | undefined | null;
}

export interface Milestone {
  id: string;
  title: string;
  [key: string]: string | number | boolean | undefined | null;
}

export interface Certificate {
  id: number;
  title: string;
  file_path: string;
  [key: string]: string | number | boolean | undefined | null;
}

export interface Group {
  id: number;
  name: string;
  description: string;
  [key: string]: string | number | boolean | undefined | null;
}

export interface GroupMessage {
  id: number;
  user_name: string;
  content: string;
  created_at: string;
  [key: string]: string | number | boolean | undefined | null;
}

export interface Roadmap {
  id: string;
  title: string;
  [key: string]: string | number | boolean | undefined | null;
}

export interface AnalyticsSeries {
  date: string;
  xp: number;
  [key: string]: string | number | boolean | undefined | null;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  xp: number;
  level: number;
  avatar?: string;
  streak: number;
  problems_solved: number;
  is_pro: boolean;
}

export interface Reward {
  id: number;
  title: string;
  cost: number;
  [key: string]: string | number | boolean | undefined | null;
}

export interface StartupIdea {
  id: number;
  domain: string;
  idea: string;
  [key: string]: string | number | boolean | undefined | null;
}

export interface ResumeHistory {
  id: number;
  score: number;
  [key: string]: string | number | boolean | undefined | null;
}

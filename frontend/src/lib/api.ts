/**
 * Central API client for Tulasi AI backend.
 * Usage: import { api } from "@/lib/api"
 */

const isBrowser = typeof window !== "undefined";
const isDev = process.env.NODE_ENV === "development";
import toast from "react-hot-toast";

// ─── Types ─────────────────────────────────────────────────────────
export interface Stats {
  total_users: number; active_24h: number; active_today: number;
  total_reviews: number; total_submissions: number;
  total_hackathon_participants: number; total_chat_messages: number;
  pro_users: number;
}
export interface AdminUser {
  id: number; name: string; email: string; role: string; xp: number;
  level: number; streak: number; is_pro: boolean; created_at: string;
  last_seen: string; last_activity_date: string; is_active: boolean;
}
export interface Review {
  id: number; name: string; role: string; review: string; rating: number;
  created_at: string; user_email: string; is_featured: boolean;
}
export interface Activity {
  id: number; user_name: string; user_email: string; action_type: string;
  title: string; metadata: string; xp: number; created_at: string;
}
export interface LeaderboardEntry {
  rank: number; id: number; name: string; email: string; xp: number;
  level: number; streak: number; is_pro: boolean; is_top10: boolean;
}
export interface CodeAnalytics {
  total_submissions: number; accepted_count: number; wrong_answer_count: number;
  acceptance_rate: number; top_solvers: { name: string; email: string; solved_count: number; xp: number }[];
  unique_solvers: number; total_problems_available: number;
}
export interface ChatAnalytics {
  total_messages: number; user_messages: number; ai_messages: number;
  active_users_7d: number; active_users_24h: number;
  last_conversations: { title: string; user_name: string; user_email: string; last_message: string; created_at: string }[];
}
export interface Analytics {
  growth: { date: string; signups: number; actions: number }[];
  segmentation: { name: string; value: number; color: string }[];
}
export interface Hackathon {
  id: number; name: string; organizer: string; status: string;
  deadline: string; prize: string; link: string; participants_count: number;
}



// ─── API Base URL ─────────────────────────────────────────────────────────────
// Priority: 1. ENV VAR (from .env.local or Vercel)
//           2. Localhost:10000 (if in development)
//           3. Production Render URL (Final Fallback)
const DEFAULT_PROD_URL = "https://tulasi-ai-wgwl.onrender.com";
const LOCAL_DEV_URL = "http://localhost:10000";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 
  (isDev ? LOCAL_DEV_URL : DEFAULT_PROD_URL);

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
    // Don't redirect here — the dashboard layout handles auth guards.
    // Redirecting from API helper causes loops during the session loading phase.
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

async function fetchWithRetry(url: string, options: RequestInit, retries = 5, backoff = 1000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);

    // If we get a 500, 502, 503, or 504, the backend might be starting or crashing.
    if (res.status >= 500 && retries > 0) {
      console.warn(`[TulasiAPI] Server error ${res.status}. Retrying in ${backoff}ms... (${retries} retries left)`);
      // Only show toast after 3 failures (retries=2) — genuine cold start, not a transient blip
      if (isBrowser && retries === 2) {
          toast.loading("Backend warming up — hang tight...", { 
              id: "retry-toast",
              duration: Infinity,
              style: { backgroundColor: "#0F172A", color: "#94A3B8", border: "1px solid #1E293B", borderRadius: "12px", fontSize: "13px", fontWeight: "500" }
          });
      }
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }

    // Silently dismiss the loading toast on recovery
    if (isBrowser) toast.dismiss("retry-toast");
    return res;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (retries > 0 && err.name !== "AbortError") {
      console.warn(`[TulasiAPI] Network error. Retrying in ${backoff}ms... (${retries} retries left)`, err);
      if (isBrowser && retries === 2) {
          toast.loading("Connecting to backend...", { id: "retry-toast",
            style: { backgroundColor: "#0F172A", color: "#94A3B8", border: "1px solid #1E293B", borderRadius: "12px", fontSize: "13px" }
          });
      }
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    if (isBrowser) toast.dismiss("retry-toast");
    if (err.name === "AbortError") throw new Error("Request timed out (60s). Please try again.");
    throw err;
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
      console.log(`[API Request] → ${options.method || "GET"} ${fullUrl}`);
      const t0 = performance.now();
      const res = await fetchWithRetry(fullUrl, { 
        credentials: "omit", 
        ...options, 
        headers, 
        mode: "cors",
        cache: "no-store", // Prevent stale health/session data
      });
      const t1 = performance.now();
      console.log(`[API Response] ← ${res.status} ${fullUrl} (${Math.round(t1 - t0)}ms)`);
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

// ─── Admin ───────────────────────────────────────────────────────────────────
export const adminApi = {
  stats: () => request<Stats>("/api/admin/stats"),
  users: () => request<{ users: AdminUser[] }>("/api/admin/users"),
  reviews: () => request<{ reviews: Review[] }>("/api/admin/reviews"),
  activity: () => request<{ activity: Activity[] }>("/api/admin/activity"),
  leaderboard: () => request<{ leaderboard: LeaderboardEntry[] }>("/api/admin/leaderboard"),
  code: () => request<CodeAnalytics>("/api/admin/code-analytics"),
  chat: () => request<ChatAnalytics>("/api/admin/chat-analytics"),
  hackathons: () => request<{ hackathons: Hackathon[] }>("/api/admin/hackathons"),
  analytics: () => request<Analytics>("/api/admin/analytics"),
  toggleUser: (user_id: number, is_active: boolean) =>
    request<{ message: string }>("/api/admin/toggle-user", {
      method: "POST",
      body: JSON.stringify({ user_id, is_active }),
    }),
  deleteReview: (id: number) =>
    request<{ message: string }>(`/api/admin/reviews/${id}`, { method: "DELETE" }),
  featureReview: (id: number) =>
    request<{ message: string; is_featured: boolean }>(`/api/admin/reviews/${id}/feature`, { method: "PATCH" }),
  seedHackathons: () =>
    request<{ message: string }>("/api/admin/seed-hackathons", { method: "POST" }),
  seedReviews: () =>
    request<{ message: string }>("/api/admin/seed-reviews", { method: "POST" }),
  deleteHackathon: (id: number) =>
    request<{ message: string }>(`/api/admin/hackathons/${id}`, { method: "DELETE" }),
};

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
  list: (tag?: string, status?: string, q?: string, difficulty?: string, mode?: string, token?: string, limit: number = 12, offset: number = 0) => {
    const params = new URLSearchParams();
    if (tag && tag !== "All") params.append("tag", tag);
    if (status && status !== "All") params.append("status", status);
    if (q) params.append("q", q);
    if (difficulty && difficulty !== "All") params.append("difficulty", difficulty);
    if (mode && mode !== "All") params.append("mode", mode);
    params.append("limit", limit.toString());
    params.append("offset", offset.toString());
    return request<{ hackathons: Hackathon[]; total: number; limit: number; offset: number }>(`/api/hackathons?${params.toString()}`, {}, token);
  },
  get: (id: number, token?: string) => request<Hackathon>(`/api/hackathons/${id}`, {}, token),
  recommend: (token: string) => request<{ recommendations: Hackathon[] }>("/api/hackathons/recommend", {}, token),
  apply: (id: number, token: string) =>
    request<{ message: string; status: string }>(`/api/hackathons/${id}/apply`, { method: "POST" }, token),
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
  submit: (code: string, language: string, problem_id: string, token: string) =>
    request<{ verdict: string; status: string; message: string; stdout: string; stderr: string; expected: string; execution_time_ms: number; newly_solved: boolean; xp_earned: number; failed_input?: string; test_cases_passed?: number; total_test_cases?: number }>("/api/code/submit", { method: "POST", body: JSON.stringify({ code, language, problem_id }) }, token),
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
      method: "PATCH",
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
  email?: string;
  role?: string;
  review: string;
  rating: number;
  created_at: string;
}

export const reviewsApi = {
  getReviews: () => request<ReviewItem[]>("/api/reviews"),
  submitReview: (data: { name: string; email?: string; role?: string; review: string; rating: number }) =>
    request<ReviewItem>("/api/reviews", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const usersApi = {
  removeBg: async (file: File, token: string) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_URL}/api/users/avatar/remove-bg`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) throw new Error("Background removal failed");
    return res.blob();
  }
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
  organizer: string;
  description: string;
  prize_pool: string;
  deadline: string;
  registration_deadline?: string;
  registration_link: string;
  tags: string;
  image_url: string;
  participants_count: number;
  status: string;
  bookmarked: boolean;
  applied: boolean;
  application_status: string;
  mode: string;
  difficulty: string;
  team_size: string;
  start_date: string;
  end_date: string;
  domains: string;
  currency: string;
  location?: string;
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

// ─── PDF / Document Q&A ──────────────────────────────────────────────

export const pdfApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request<{ filename: string; chunks_indexed: number; message: string }>("/api/pdf/upload", {
      method: "POST",
      body: formData,
    });
  },
  status: () => request<{ indexed_chunks: number }>("/api/pdf/status"),
  clear: () => request<{ message: string }>("/api/pdf/clear", { method: "DELETE" }),
};

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

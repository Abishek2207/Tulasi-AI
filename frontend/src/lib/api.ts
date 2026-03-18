/**
 * Central API client for Tulasi AI backend.
 * Usage: import { api } from "@/lib/api"
 */

const isBrowser = typeof window !== "undefined";
const isDev = process.env.NODE_ENV === "development";

const DEFAULT_BACKEND_URL = "https://tulasi-ai-soda.onrender.com";
// In production, use empty string to trigger `/api/...` so Vercel rewrites intercept it.
// In development, force the local backend URL so it doesn't accidentally hit Render from .env.local
export const API_URL = isDev
  ? DEFAULT_BACKEND_URL
  : (isBrowser ? "" : (process.env.NEXT_PUBLIC_API_URL || DEFAULT_BACKEND_URL));

/** Build a WebSocket URL pointing at the correct host (wss in production, ws locally) */
export function websocketUrl(path: string): string {
  if (!isBrowser) return "";
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  
  if (!isDev) {
     // In production, the backend is on render directly for WS, because Vercel Serverless Functions
     // do not support WebSockets. We must connect directly to the render WebSocket URL.
     const backendHost = new URL(process.env.NEXT_PUBLIC_API_URL || "https://tulasi-api-ldcw.onrender.com").host;
     return `${protocol}//${backendHost}${path}`;
  }
  
  const host = new URL(process.env.NEXT_PUBLIC_API_URL || DEFAULT_BACKEND_URL).host;
  return `${protocol}//${host}${path}`;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const FETCH_TIMEOUT_MS = 5_000; // 5 second timeout per request attempt

async function fetchWithRetry(url: string, options: RequestInit, retries = 5): Promise<Response> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      if (res.status === 502 || res.status === 503 || res.status === 504) {
         throw new Error("API error / Server waking up");
      }
      // If it's a 4xx error (e.g. invalid credentials), let it pass through to be handled by the caller,
      // as retrying won't help. We throw an error here to force a retry ONLY for 5xx type errors or generic failures.
      if (res.status >= 500) {
         throw new Error(`API error: ${res.status}`);
      }
      return res; // return early for 4xx errors
    }
    return res;
  } catch (err: any) {
    if (retries === 0) throw err;
    await new Promise(r => setTimeout(r, 1000 * (6 - retries)));
    return fetchWithRetry(url, options, retries - 1);
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await fetchWithRetry(`${API_URL}${path}`, { ...options, headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || `Request failed: ${res.status}`);
    }
    return res.json();
  } catch (err: any) {
    throw new Error(err.message || "Network Error");
  }
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (email: string, password: string, name: string) =>
    request<{ access_token: string; user: User }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }),

  login: (email: string, password: string) =>
    request<{ access_token: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: (token: string) =>
    request<User>("/api/auth/me", {}, token),
};

// ─── Chat ────────────────────────────────────────────────────────────────────

export const chatApi = {
  send: (message: string, session_id: string | undefined, token: string) =>
    request<{ response: string; session_id: string; model_used: string }>(
      "/api/chat",
      { method: "POST", body: JSON.stringify({ message, session_id }) },
      token
    ),

  history: (session_id: string, token: string) =>
    request<{ messages: ChatMsg[]; session_id: string }>(
      `/api/chat/history/${session_id}`,
      {},
      token
    ),

  clearHistory: (session_id: string, token: string) =>
    request<{ message: string }>(`/api/chat/history/${session_id}`, { method: "DELETE" }, token),
};

// ─── PDF / RAG ───────────────────────────────────────────────────────────────

export const pdfApi = {
  upload: async (file: File, token: string) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetchWithRetry(`${API_URL}/api/pdf/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (!res.ok) throw new Error((await res.json()).detail || "Upload failed");
    return res.json() as Promise<{ session_id: string; pages: number; filename: string }>;
  },

  ask: (question: string, session_id: string, token: string) =>
    request<{ answer: string; source: string }>(
      "/api/pdf/ask",
      { method: "POST", body: JSON.stringify({ question, session_id }) },
      token
    ),
};

// ─── Roadmap ─────────────────────────────────────────────────────────────────

export const roadmapApi = {
  getRoadmaps: (token: string) => request<{ roadmaps: any[], completed_milestones: string[] }>("/api/roadmap/", {}, token),
  getRoadmap: (id: string, token: string) => request<any>(`/api/roadmap/${id}`, {}, token),
  logProgress: (roadmap_id: string, milestone_id: string, token: string) =>
    request<{ message: string; xp_earned: number }>("/api/roadmap/progress", {
      method: "POST",
      body: JSON.stringify({ roadmap_id, milestone_id }),
    }, token),
  generate: (topic: string, token: string) =>
    request<{ roadmap: any }>("/api/roadmap/generate", {
      method: "POST",
      body: JSON.stringify({ topic }),
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
    return request<{ hackathons: any[]; total: number }>(`/api/hackathons?${params.toString()}`, {}, token);
  },
  get: (id: number, token?: string) => request<any>(`/api/hackathons/${id}`, {}, token),
  create: (data: any, token: string) =>
    request<any>("/api/hackathons", {
      method: "POST",
      body: JSON.stringify(data),
    }, token),
  bookmark: (id: number, token: string) =>
    request<any>(`/api/hackathons/${id}/bookmark`, { method: "POST" }, token),
  unbookmark: (id: number, token: string) =>
    request<any>(`/api/hackathons/${id}/bookmark`, { method: "DELETE" }, token),
  bookmarked: (token: string) =>
    request<{ hackathons: any[] }>("/api/hackathons/bookmarked", {}, token),
};

// ─── Study Rooms ─────────────────────────────────────────────────────────────

export const studyApi = {
  rooms: () => request<{ rooms: any[] }>("/api/study/rooms"),
  create: (data: any, token: string) =>
    request<any>("/api/study/create", { method: "POST", body: JSON.stringify(data) }, token),
  join: (roomId: number | string, token: string) =>
    request<any>(`/api/study/join/${roomId}`, { method: "POST" }, token),
  messages: (roomId: number | string, token: string, limit = 50) =>
    request<{ room_id: number; room_name: string; messages: any[] }>(`/api/study/${roomId}/messages?limit=${limit}`, {}, token),
  sendMessage: (roomId: number | string, content: string, token: string) =>
    request<any>(`/api/study/${roomId}/messages`, { method: "POST", body: JSON.stringify({ content }) }, token),
};

// ─── Code Practice ───────────────────────────────────────────────────────────

export const codeApi = {
  problems: (category?: string, difficulty?: string, search?: string, token?: string) => {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (difficulty) params.append("difficulty", difficulty);
    if (search) params.append("search", search);
    return request<{ problems: any[]; categories: string[]; total: number; solved_count: number }>(`/api/code/problems?${params.toString()}`, {}, token);
  },
  getProblem: (id: string, token: string) => request<any>(`/api/code/problems/${id}`, {}, token),
  markSolved: (id: string, token: string) =>
    request<any>(`/api/code/problems/${id}/solve`, { method: "POST" }, token),
  run: (code: string, language: string, token: string, stdin?: string) =>
    request<{ output: string; status: string; execution_time_ms?: number }>("/api/code/run", { method: "POST", body: JSON.stringify({ code, language, stdin }) }, token),
  explain: (code: string, language: string, token: string) =>
    request<{ explanation: string; status: string }>("/api/code/explain", { method: "POST", body: JSON.stringify({ code, language }) }, token),
};

// ─── Startup Lab ─────────────────────────────────────────────────────────────

export const startupApi = {
  generate: (domain: string, target_audience: string, token: string) =>
    request<{ status: string; idea: any }>("/api/startup/generate", { method: "POST", body: JSON.stringify({ domain, target_audience }) }, token),
  save: (idea: any, token: string) =>
    request<{ message: string; id: number }>("/api/startup/save", { method: "POST", body: JSON.stringify(idea) }, token),
  ideas: (token: string) => request<{ ideas: any[] }>("/api/startup/ideas", {}, token),
};

// ─── Certificates ────────────────────────────────────────────────────────────

export const certificateApi = {
  list: (token: string) => request<{ certificates: any[], milestones: any[] }>("/api/certificates/my", {}, token),
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
  improve: (data: any, token: string) =>
    request<{ ats_score: number; feedback: string[]; missing_keywords: string[]; improved_resume: string }>("/api/resume/improve", {
      method: "POST",
      body: JSON.stringify(data),
    }, token),
};

// ─── Health Check ─────────────────────────────────────────────────────────────

/** Health check — uses the correct /api/health path (NOT /health) */
export const healthCheck = () =>
  request<{ status: string; server: string; version: string; services: string[]; uptime_seconds: number }>("/api/health");

// ─── Gamification & Activity ─────────────────────────────────────────────────

export const activityApi = {
  getStats: (token: string) => request<any>("/api/activity/stats", {}, token),
  getLeaderboard: (token?: string) => request<{ leaderboard: any[] }>("/api/activity/leaderboard", {}, token),
  getAnalytics: (token: string) => request<{ time_series: any[], total_period_xp: number, total_period_problems: number }>("/api/activity/analytics", {}, token)
};

// ─── Profile ─────────────────────────────────────────────────────────────────

export const profileApi = {
  update: (data: { name?: string; bio?: string; skills?: string }, token: string) =>
    request<{ message: string; user: any }>("/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }, token),
};

// ─── Group Chat ───────────────────────────────────────────────────────────────

export const groupApi = {
  list: (token: string) => request<{ groups: any[] }>("/api/groups", {}, token),
  create: (name: string, description: string, token: string) =>
    request<any>("/api/groups/create", {
      method: "POST",
      body: JSON.stringify({ name, description }),
    }, token),
  join: (join_code: string, token: string) =>
    request<{ message: string; group: any }>("/api/groups/join", {
      method: "POST",
      body: JSON.stringify({ join_code }),
    }, token),
  getMessages: (groupId: number, token: string) =>
    request<{ group_id: number; messages: any[] }>(`/api/groups/${groupId}/messages`, {}, token),
  sendMessage: (groupId: number, content: string, token: string) =>
    request<any>(`/api/groups/${groupId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }, token),
};

// ─── Rewards ─────────────────────────────────────────────────────────────────

export const rewardApi = {
  getRewards: (token: string) => request<{ rewards: any[] }>("/api/activity/rewards", {}, token),
  redeem: (reward_id: number, token: string) => 
    request<{ message: string; remaining_xp: number }>("/api/activity/rewards/redeem", {
      method: "POST",
      body: JSON.stringify({ reward_id })
    }, token)
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
}

export interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

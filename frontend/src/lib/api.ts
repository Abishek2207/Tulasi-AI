/**
 * Central API client for Tulasi AI backend.
 * Usage: import { api } from "@/lib/api"
 */

const isBrowser = typeof window !== "undefined";
const isLocal = isBrowser && window.location.hostname === "localhost";
// In production, use empty string to trigger `/api/...` so Vercel rewrites intercept it.
const API_URL = isBrowser && !isLocal ? "" : (process.env.NEXT_PUBLIC_API_URL || "https://tulasi-api.onrender.com");

/** Build a WebSocket URL pointing at the correct host (wss in production, ws locally) */
export function websocketUrl(path: string): string {
  if (!isBrowser) return "";
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  
  if (!isLocal) {
     // In production, the backend is on render directly for WS, because Vercel Serverless Functions
     // do not support WebSockets. We must connect directly to the render WebSocket URL.
     const backendHost = new URL(process.env.NEXT_PUBLIC_API_URL || "https://tulasi-api.onrender.com").host;
     return `${protocol}//${backendHost}${path}`;
  }
  
  const host = new URL(process.env.NEXT_PUBLIC_API_URL || "https://tulasi-api.onrender.com").host;
  return `${protocol}//${host}${path}`;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const FETCH_TIMEOUT_MS = 15_000; // 15 second timeout per request attempt

// Retry utility with exponential backoff, jitter, and AbortController timeout
async function fetchWithRetry(url: string, options: RequestInit, retries = 3): Promise<Response> {
  let attempt = 0;
  while (attempt < retries) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);

      // Handle Render's "Service Waking Up" 502/503/504 during cold start
      if (res.status === 502 || res.status === 503 || res.status === 504) {
        throw new Error(`Backend waking up (Status ${res.status})`);
      }

      return res;
    } catch (err: any) {
      clearTimeout(timeoutId);
      attempt++;
      if (attempt >= retries) {
        console.error(`Final API failure after ${retries} attempts:`, err);
        throw err;
      }
      // Exponential backoff: 2s, 4s, 8s with random jitter
      const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
      console.warn(`API Attempt ${attempt} failed. Retrying in ${Math.round(delay)}ms...`, err.message);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error("Max retries reached");
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
  list: (tag?: string, status?: string) => {
    const params = new URLSearchParams();
    if (tag) params.append("tag", tag);
    if (status) params.append("status", status);
    return request<{ hackathons: any[]; total: number }>(`/api/hackathons?${params.toString()}`);
  },
  get: (id: number) => request<any>(`/api/hackathons/${id}`),
  create: (data: any, token: string) =>
    request<any>("/api/hackathons", {
      method: "POST",
      body: JSON.stringify(data),
    }, token),
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
  generate: (milestoneId: string, token: string) => request<{ message: string }>(`/api/certificates/generate/${milestoneId}`, { method: "POST" }, token)
};

// ─── Health Check ─────────────────────────────────────────────────────────────

/** Health check — uses the correct /api/health path (NOT /health) */
export const healthCheck = () =>
  request<{ status: string; server: string; version: string; services: string[]; uptime_seconds: number }>("/api/health");

// ─── Gamification & Activity ─────────────────────────────────────────────────

export const activityApi = {
  getStats: (token: string) => request<any>("/api/activity/stats", {}, token),
  getLeaderboard: (token: string) => request<{ leaderboard: any[] }>("/api/activity/leaderboard", {}, token),
  getAnalytics: (token: string) => request<{ time_series: any[], total_period_xp: number, total_period_problems: number }>("/api/activity/analytics", {}, token)
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

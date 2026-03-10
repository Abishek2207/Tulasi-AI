/**
 * Central API client for Tulasi AI backend.
 * Usage: import { api } from "@/lib/api"
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "";

// ─── Helpers ────────────────────────────────────────────────────────────────

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

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `Request failed: ${res.status}`);
  }
  return res.json();
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
    const res = await fetch(`${API_URL}/api/pdf/upload`, {
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
  generate: (topic: string, token: string) =>
    request<{ roadmap: any }>("/api/roadmap/generate", {
      method: "POST",
      body: JSON.stringify({ topic }),
    }, token),
};

// ─── Interview ───────────────────────────────────────────────────────────────

export const interviewApi = {
  start: (role: string, token: string) =>
    request<{ question: string; session_id: string }>("/api/interview/start", {
      method: "POST",
      body: JSON.stringify({ role }),
    }, token),

  answer: (answer: string, session_id: string, token: string) =>
    request<{ feedback: string; score: number; next_question?: string }>(
      "/api/interview/answer",
      { method: "POST", body: JSON.stringify({ answer, session_id }) },
      token
    ),
};

// ─── Health Check ─────────────────────────────────────────────────────────────

export const healthCheck = () =>
  request<{ status: string; version: string }>("/health");

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

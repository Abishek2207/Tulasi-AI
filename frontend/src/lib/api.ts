/**
 * Central API client for Tulasi AI backend.
 * Usage: import { api } from "@/lib/api"
 */

const isBrowser = typeof window !== "undefined";
const isDev = process.env.NODE_ENV === "development";
import toast from "react-hot-toast";

// ─── API Base URL ─────────────────────────────────────────────────────────────
// Env var is baked in at Vercel build time; fallback ensures local dev always works.
// We strip any trailing slashes or /api suffixes to prevent /api/api duplication.
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://tulasiai.up.railway.app")
  .replace(/\/api\/?$/, "")
  .replace(/\/$/, "");

/** Centralised debug logger — always prints in dev; silent in prod unless token missing */
function log(label: string, data?: any) {
  if (isDev) {
    console.log(`[TulasiAPI] ${label}`, data ?? "");
  }
}

/** Resolve the best available token: argument → localStorage → undefined */
function resolveToken(passed?: string): string | undefined {
  if (passed) return passed;
  if (isBrowser) {
    const stored = localStorage.getItem("token");
    if (stored) return stored;
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

const FETCH_TIMEOUT_MS = 5_000; // 5 second timeout per request attempt

async function fetchWithRetry(url: string, options: RequestInit, retries = 5): Promise<Response> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      if (res.status === 502 || res.status === 503 || res.status === 504) {
         if (retries === 5) toast.loading("Server waking up. Retrying...", { id: "retry-toast" }); // Show only once on first attempt
         throw new Error("API error / Server waking up");
      }
      // If it's a 4xx error (e.g. invalid credentials), let it pass through to be handled by the caller,
      // as retrying won't help. We throw an error here to force a retry ONLY for 5xx type errors or generic failures.
      if (res.status >= 500) {
         toast.error(`Server error: ${res.status}`);
         throw new Error(`API error: ${res.status}`);
      }
      return res; // return early for 4xx errors
    }
    toast.dismiss("retry-toast");
    return res;
  } catch (err: any) {
    if (retries === 0) {
      toast.dismiss("retry-toast");
      toast.error("Connection failed. Server offline.");
      throw err;
    }
    await new Promise(r => setTimeout(r, 1000 * (6 - retries)));
    return fetchWithRetry(url, options, retries - 1);
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const resolvedToken = resolveToken(token);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (resolvedToken) headers["Authorization"] = `Bearer ${resolvedToken}`;

  const fullUrl = `${API_URL}${path}`;
  
  // LIVE DEBUG LOGGING
  console.log("TOKEN:", resolvedToken || "undefined");
  console.log("HEADERS:", headers);
  console.log("REQUEST:", fullUrl);

  log(`→ ${options.method || "GET"} ${fullUrl}`, { hasToken: !!resolvedToken });

  try {
    const res = await fetchWithRetry(fullUrl, { ...options, headers });
    log(`← ${res.status} ${fullUrl}`);

    if (!res.ok) {
      if (res.status === 401) throw new Error("Session expired. Please log in again.");
      
      let backendMsg = res.statusText;
      try {
        const errJson = await res.json();
        backendMsg = errJson.detail || errJson.message || errJson.error || backendMsg;
      } catch (e) {}
      
      if (res.status >= 500) throw new Error(`500 Server Error: ${backendMsg}`);
      throw new Error(backendMsg || `Request failed: ${res.status}`);
    }
    return res.json();
  } catch (err: any) {
    const msg = err.message || "Network Error";
    if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("ERR_NAME_NOT_RESOLVED")) {
      throw new Error("Backend unreachable. Check your connection.");
    }
    throw new Error(msg);
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
  send: (message: string, session_id: string | undefined, token: string, tool?: string) =>
    request<{ response: string; session_id: string; model_used: string }>(
      "/api/chat",
      { method: "POST", body: JSON.stringify({ message, session_id, tool }) },
      token
    ),

  /** Streaming SSE — calls onToken for each chunk, onDone when complete */
  streamSend: async (
    message: string,
    session_id: string | undefined,
    token: string,
    tool: string,
    onToken: (token: string) => void,
    onDone: (sessionId: string) => void,
    onError: (err: string) => void
  ): Promise<void> => {
    // Always resolve the best available token
    const resolvedToken = resolveToken(token);
    const streamUrl = `${API_URL}/api/chat/stream`;

    log("→ POST (stream) /api/chat/stream", {
      apiUrl: API_URL,
      hasToken: !!resolvedToken,
      tokenSnippet: resolvedToken ? resolvedToken.slice(0, 20) + "..." : "none",
      tool,
      session_id,
    });

    // Build headers explicitly so we can log them
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(resolvedToken ? { Authorization: `Bearer ${resolvedToken}` } : {}),
    };

    // LIVE DEBUG LOGGING
    console.log("TOKEN:", resolvedToken || "undefined");
    console.log("HEADERS:", headers);
    console.log("REQUEST:", streamUrl);

    try {
      const res = await fetch(streamUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({ message, session_id, tool }),
      });

      log(`← stream response status: ${res.status}`);

      if (!res.ok) {
        if (res.status === 401) {
          onError("401 - Session expired. Please log in again.");
          return;
        }
        
        let backendMsg = `HTTP ${res.status}`;
        if (res.body) {
           try {
              // Try to read a chunk to parse the error message
              const reader = res.body.getReader();
              const { value } = await reader.read();
              if (value) {
                 const text = new TextDecoder().decode(value);
                 const json = JSON.parse(text);
                 backendMsg = json.detail || json.error || json.message || text.substring(0, 100);
              }
           } catch(e) {}
        }

        if (res.status >= 500) {
          onError(`500 Server Error: ${backendMsg}`);
          return;
        }
        onError(`Request failed: ${backendMsg}`);
        return;
      }

      if (!res.body) {
        onError("500 - Empty response from server.");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split("\n").filter(l => l.startsWith("data:"));

        for (const line of lines) {
          try {
            const json = JSON.parse(line.slice(5).trim());
            if (json.error) { onError(json.token || "AI error."); return; }
            if (json.done) { onDone(json.session_id); return; }
            if (json.token) onToken(json.token);
          } catch {}
        }
      }
    } catch (err: any) {
      const msg: string = err.message || "";
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("ERR_NAME_NOT_RESOLVED")) {
        onError("Backend unreachable. Check your internet or try again later.");
      } else {
        onError(msg || "Unknown network error.");
      }
    }
  },

  feedback: (session_id: string, message_id: string, rating: number, token: string) =>
    request<{ status: string }>("/api/chat/feedback", {
      method: "POST",
      body: JSON.stringify({ session_id, message_id, rating }),
    }, token),

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
  improve: (data: { resume_text: string, job_description: string, mode: string, document_type: string }, token: string) =>
    request<{ ats_score: number; readability_score: number; keyword_match_percent: number; feedback: string[]; missing_keywords: string[]; improved_resume: string }>("/api/resume/improve", {
      method: "POST",
      body: JSON.stringify(data),
    }, token),
  
  getHistory: (token: string) =>
    request<any[]>("/api/resume/history", {
      method: "GET",
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

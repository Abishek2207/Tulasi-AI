/**
 * TulasiAI — Centralized API Client
 * All backend calls go through here. Never put fetch() directly in pages.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://tulasi-ai-hycl.onrender.com";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null; source?: string; fetched_at?: string }> {
  try {
    const token = getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> || {}),
    };

    const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Request failed" }));
      return { data: null, error: err.detail || `Error ${res.status}` };
    }

    const json = await res.json();
    return { data: json, error: null, fetched_at: new Date().toISOString() };
  } catch (e: any) {
    return { data: null, error: e?.message || "Network error" };
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  me: () => apiFetch<any>("/api/auth/me"),
};

// ─── Profile ──────────────────────────────────────────────────────────────────
export const profileApi = {
  get: () => apiFetch<any>("/api/profile"),
  update: (data: any) => apiFetch<any>("/api/profile", { method: "PUT", body: JSON.stringify(data) }),
};

// ─── Hackathons ───────────────────────────────────────────────────────────────
export interface Hackathon {
  id: string | number;
  title: string;
  deadline?: string;
  mode?: string;          // online / offline / hybrid
  eligibility?: string;
  registration_url?: string;
  source_url?: string;
  source?: string;
  fetched_at?: string;
  prize?: string;
  description?: string;
}

export const hackathonsApi = {
  list: () => apiFetch<Hackathon[]>("/api/hackathons"),
};

// ─── Jobs / Internships ───────────────────────────────────────────────────────
export interface JobListing {
  id: string | number;
  title: string;
  company: string;
  location?: string;
  remote?: boolean;
  stipend?: string;
  posted_date?: string;
  apply_link?: string;
  source?: string;
  match_reason?: string;
  skills_required?: string[];
  fetched_at?: string;
}

export const jobsApi = {
  list: (params?: { skills?: string; location?: string }) => {
    const qs = params ? "?" + new URLSearchParams(params as any).toString() : "";
    return apiFetch<JobListing[]>(`/api/internships${qs}`);
  },
};

// ─── Interview ────────────────────────────────────────────────────────────────
export const interviewApi = {
  start: (data: { role: string; level: string }) =>
    apiFetch<any>("/api/interview/start", { method: "POST", body: JSON.stringify(data) }),
  submit: (sessionId: string, answer: string) =>
    apiFetch<any>("/api/interview/answer", { method: "POST", body: JSON.stringify({ session_id: sessionId, answer }) }),
};

// ─── Roadmap ──────────────────────────────────────────────────────────────────
export const roadmapApi = {
  generate: (data: any) =>
    apiFetch<any>("/api/roadmap/generate", { method: "POST", body: JSON.stringify(data) }),
  get: () => apiFetch<any>("/api/roadmap"),
};

// ─── Chat (AI) ────────────────────────────────────────────────────────────────
export const chatApi = {
  send: (message: string, context?: string) =>
    apiFetch<any>("/api/chat", { method: "POST", body: JSON.stringify({ message, context }) }),
};

// ─── Activity / Progress ─────────────────────────────────────────────────────
export const activityApi = {
  get: () => apiFetch<any>("/api/activity"),
  log: (data: { type: string; value: any }) =>
    apiFetch<any>("/api/activity", { method: "POST", body: JSON.stringify(data) }),
};

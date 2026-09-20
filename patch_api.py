import json

with open("frontend/src/lib/api.ts", "a", encoding="utf-8") as f:
    f.write("""
export const systemDesignApi = {
  generateScenario: (role: string, difficulty: string, company_focus: string | null, token: string) =>
    request<any>("/api/system-design/generate-scenario", {
      method: "POST",
      body: JSON.stringify({ role, difficulty, company_focus })
    }, token),
  guidedSolution: (problem_id: string, current_step: number, user_input: string, token: string) =>
    request<any>("/api/system-design/guided-solution", {
      method: "POST",
      body: JSON.stringify({ problem_id, current_step, user_input })
    }, token)
};
""")

with open("frontend/src/lib/api.ts", "r", encoding="utf-8") as f:
    content = f.read()

old_str = '''  answer: (answer: string, session_id: string, token: string) =>
    request<{ feedback: string; score: number; next_question?: string }>(
      "/api/interview/answer",
      { method: "POST", body: JSON.stringify({ answer, session_id }) },
      token
    ),'''

new_str = '''  answer: async (answer: string, session_id: string, token: string, audioBlob?: Blob) => {
    if (audioBlob) {
      const formData = new FormData();
      formData.append("session_id", session_id);
      formData.append("answer", answer);
      formData.append("audio_file", audioBlob, "answer.webm");
      
      const res = await fetch(`${API_BASE_URL}/api/interview/answer-audio`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
         const err = await res.json().catch(() => ({ detail: "API Error" }));
         throw new Error(err.detail || "API Error");
      }
      return res.json();
    }
    return request<any>(
      "/api/interview/answer",
      { method: "POST", body: JSON.stringify({ answer, session_id }) },
      token
    );
  },'''

content = content.replace(old_str, new_str)
with open("frontend/src/lib/api.ts", "w", encoding="utf-8") as f:
    f.write(content)

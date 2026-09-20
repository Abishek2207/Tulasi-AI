import re

with open('frontend/src/lib/api.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace notificationsApi
notif_stub = "export const notificationsApi: any = new Proxy({}, { get: () => () => Promise.resolve({}) });"
notif_impl = """export const notificationsApi = {
  getNotifications: (token?: string) => request<any>('/api/notifications', {}, token),
  getTrending: () => request<any>('/api/notifications/trending'),
  markRead: (id: string, token?: string) => request<any>(`/api/notifications/read/${id}`, { method: 'POST' }, token),
  markAllRead: (token?: string) => request<any>('/api/notifications/read-all', { method: 'POST' }, token)
};"""

content = content.replace(notif_stub, notif_impl)

# Add jarvisApi if it doesn't exist
if 'export const jarvisApi' not in content:
    content += """

export const jarvisApi = {
  getDailyNudge: (token?: string) => request<any>('/api/jarvis/daily-nudge', {}, token),
  getFocusSuggestion: (token?: string) => request<any>('/api/jarvis/focus-suggestion', {}, token),
  getAccountabilitySummary: (token?: string) => request<any>('/api/jarvis/accountability-summary', {}, token),
  parseCommand: (command: string, token?: string) => request<any>('/api/jarvis/command', { method: 'POST', body: JSON.stringify({ command }) }, token)
};
"""

# Enhance streakApi if it's already there (or add it if not)
streak_search = re.search(r"export const streakApi\s*[:=].*?};", content, re.DOTALL)
streak_impl = """export const streakApi = {
  getStatus: (token?: string) => request<any>('/api/streak/status', {}, token),
  checkin: (token?: string) => request<any>('/api/streak/checkin', { method: 'POST' }, token),
  freeze: (token?: string) => request<any>('/api/streak/freeze', { method: 'POST' }, token),
  getHistory: (token?: string) => request<any>('/api/streak/history', {}, token)
};"""

if streak_search:
    content = content.replace(streak_search.group(0), streak_impl)
else:
    content += "\n" + streak_impl

with open('frontend/src/lib/api.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("api.ts updated")

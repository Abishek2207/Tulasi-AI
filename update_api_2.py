import os

with open('frontend/src/lib/api.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('stats: () => request<Stats>("/api/admin/stats"),', 
'''stats: () => request<Stats>("/api/admin/stats"),
  marketStats: () => request<any>("/api/admin/market-stats"),
  refreshMarket: () => request<any>("/api/admin/market-refresh", { method: "POST" }),''')

with open('frontend/src/lib/api.ts', 'w', encoding='utf-8') as f:
    f.write(content)

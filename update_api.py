import os

with open('frontend/src/lib/api.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('stats: () => apiFetch("/admin/stats"),', 
'''stats: () => apiFetch("/admin/stats"),
  marketStats: () => apiFetch("/admin/market-stats"),
  refreshMarket: () => apiFetch("/admin/market-refresh", { method: "POST" }),''')

with open('frontend/src/lib/api.ts', 'w', encoding='utf-8') as f:
    f.write(content)

import os

with open('frontend/src/app/admin/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace type
content = content.replace(
    'type Tab = "overview" | "metrics" | "users" | "reviews" | "activity" | "leaderboard" | "code" | "chat" | "hackathons" | "revenue" | "health" | "tools" | "internships";',
    'type Tab = "overview" | "metrics" | "users" | "reviews" | "activity" | "leaderboard" | "code" | "chat" | "hackathons" | "revenue" | "health" | "tools" | "internships" | "market";'
)

# Replace TABS array
content = content.replace(
    '{ id: "health",      label: "System Health",  icon: "🩺" },',
    '{ id: "health",      label: "System Health",  icon: "🩺" },\n  { id: "market",      label: "Market Intelligence",  icon: "🌐" },'
)

# Add state variables
content = content.replace(
    'const [health, setHealth] = useState<any>(null);',
    'const [health, setHealth] = useState<any>(null);\n  const [marketStats, setMarketStats] = useState<any>(null);'
)

# Add load trigger
content = content.replace(
    'adminApi.analytics(), adminApi.revenue(),',
    'adminApi.analytics(), adminApi.revenue(), adminApi.marketStats(),'
)
content = content.replace(
    'const [analyticsData, revData] = data.slice(8);',
    'const [analyticsData, revData, mStats] = data.slice(8);\n      setMarketStats(mStats);'
)

# Add UI rendering block
ui_block = '''
        {/* ── MARKET INTELLIGENCE ── */}
        {tab === "market" && (
          <div style={{ animation: "fadeIn 0.3s ease-out" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
              <div>
                <h1 style={{ fontSize: 26, fontWeight: 900, fontFamily: "var(--font-outfit)", marginBottom: 4 }}>🌐 Market Intelligence Engine</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Real SerpApi integration and structured market jobs</p>
              </div>
              <button 
                onClick={async () => {
                  toast.loading("Triggering orchestrated refresh...", { id: "refresh" });
                  try {
                    const res = await adminApi.refreshMarket();
                    toast.success(res.message || "Market data refreshed", { id: "refresh" });
                  } catch(e) {
                    toast.error("Failed to refresh", { id: "refresh" });
                  }
                }}
                style={{ padding: "10px 16px", background: "var(--brand)", color: "#fff", fontWeight: 700, fontSize: 13, borderRadius: 8, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 12px rgba(124,58,237,0.3)" }}>
                <i className="fa-solid fa-sync"></i>
                Force Orchestrated Refresh
              </button>
            </div>
            
            {marketStats ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                   <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Status</div>
                   <div style={{ fontSize: 22, fontWeight: 800, color: "#10B981" }}>{marketStats.status}</div>
                   <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>{marketStats.message}</div>
                </div>
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                   <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Jobs Collected</div>
                   <div style={{ fontSize: 32, fontWeight: 900 }}>{marketStats.jobs_collected}</div>
                </div>
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                   <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Market Snapshots</div>
                   <div style={{ fontSize: 32, fontWeight: 900 }}>{marketStats.market_snapshots}</div>
                </div>
              </div>
            ) : (
              <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>Loading Market Stats...</div>
            )}
          </div>
        )}

'''

content = content.replace('{/* ── HEALTH ── */}', ui_block + '\n        {/* ── HEALTH ── */}')

with open('frontend/src/app/admin/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

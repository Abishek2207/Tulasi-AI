"""
Repair streak_api.py:
- Replace current_user.streak_count → current_user.streak  (User.streak is the canonical field)
- Replace current_user.last_login  → current_user.last_seen (User.last_seen is the canonical field)
"""

with open('backend/app/api/streak_api.py', 'r', encoding='utf-8') as f:
    content = f.read()

original = content

content = content.replace('current_user.streak_count', 'current_user.streak')
content = content.replace('current_user.last_login', 'current_user.last_seen')

if content == original:
    print("❌ No replacements made — check field names manually")
else:
    changes = []
    if 'streak_count' not in content:
        changes.append("streak_count → streak")
    if 'last_login' not in content:
        changes.append("last_login → last_seen")
    print(f"✅ Replaced: {', '.join(changes)}")

with open('backend/app/api/streak_api.py', 'w', encoding='utf-8') as f:
    f.write(content)

# Verify no streak_count or last_login remain
remaining = []
if 'streak_count' in content:
    remaining.append('streak_count still present')
if 'last_login' in content:
    remaining.append('last_login still present')
if remaining:
    print(f"⚠️  Remaining issues: {remaining}")
else:
    print("✅ streak_api.py clean — no stale field references")

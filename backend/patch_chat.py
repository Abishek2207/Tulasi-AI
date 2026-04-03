import json
import re

path = r'c:\Users\Admin\Downloads\Desktop\Project\TulasiAI\backend\app\api\chat.py'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Modification 1: Lines 167-174 (0-indexed 166-173)
new_awareness_1 = [
    '    # Adaptive Decision Engine \n',
    '    intelligence = json.loads(user.user_intelligence_profile or "{}")\n',
    '    awareness = (\n',
    '        f"You are operating in the year 2026. The Founder and CEO of Tulasi AI is Abishek R. "\n',
    '        f"USER DEMOGRAPHIC: [Type: {user.user_type}, Dept: {user.department or \'N/A\'}, "\n',
    '        f"Role Target: {user.target_role or \'Software Engineer\'}, Interests: {user.interest_areas or \'General Tech\'}, "\n',
    '        f"Level: {user.level}]. "\n',
    '        f"INTELLIGENCE PROFILE: {json.dumps(intelligence)}. "\n',
    '        f"THINKING PROTOCOL: ALWAYS think deeply and internally before you respond. "\n',
    '        f"Critically analyze user intent, cross-reference their intelligence profile, and "\n',
    '        f"adjust your domain knowledge, tone, and challenge level dynamically."\n',
    '    )\n'
]
lines[166:174] = new_awareness_1

# Modification 2: Lines 273-280 (needs readjusted index since we added lines above)
# We added 12 lines and removed 8, so +4 lines offset
new_awareness_2 = [
    '    # Adaptive Decision Engine\n',
    '    intelligence = json.loads(user.user_intelligence_profile or "{}" )\n',
    '    awareness = (\n',
    '        f"You are operating in the year 2026. The Founder and CEO of Tulasi AI is Abishek R. "\n',
    '        f"USER DEMOGRAPHIC: [Type: {user.user_type}, Dept: {user.department or \'N/A\'}, "\n',
    '        f"Role Target: {user.target_role or \'Software Engineer\'}, Interests: {user.interest_areas or \'General Tech\'}, "\n',
    '        f"Level: {user.level}]. "\n',
    '        f"INTELLIGENCE PROFILE: {json.dumps(intelligence)}. "\n',
    '        f"THINKING PROTOCOL: ALWAYS think deeply and internally before you respond."\n',
    '    )\n'
]
lines[272+4:280+4] = new_awareness_2

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(lines)
print("Updated chat.py successfully!")

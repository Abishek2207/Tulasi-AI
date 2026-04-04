import os
import re

# Centralizing API URL usage across the frontend
FRONTEND_DIR = r"c:\Users\Admin\Downloads\Desktop\Project\TulasiAI\frontend\src"

# Files to skip (already fixed or the source itself)
SKIP_FILES = [
    "lib\\api.ts",
]

# Patterns to replace
# 1. process.env.NEXT_PUBLIC_API_URL
# 2. LOCAL_DEV_URL hardoced strings like "http://127.0.0.1:10000" or "http://localhost:10000"

def standardize_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    
    # Check if we need to add the import
    has_api_import = 'from "@/lib/api"' in content or "from '@/lib/api'" in content
    needs_api_import = False

    # Replacement 1: process.env.NEXT_PUBLIC_API_URL || "..."
    # We want to replace it with API_URL or API
    pattern1 = re.compile(r'process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*["\']https?://[^"\']+["\']')
    if pattern1.search(content):
        content = pattern1.sub('API_URL', content)
        needs_api_import = True

    # Replacement 2: raw process.env.NEXT_PUBLIC_API_URL
    pattern2 = re.compile(r'process\.env\.NEXT_PUBLIC_API_URL')
    if pattern2.search(content):
        content = pattern2.sub('API_URL', content)
        needs_api_import = True

    # Replacement 3: hardcoded localhost
    pattern3 = re.compile(r'["\']http://(?:127\.0\.0\.1|localhost):10000["\']')
    if pattern3.search(content):
        content = pattern3.sub('API_URL', content)
        needs_api_import = True

    if content != original_content:
        # Add import if missing
        if needs_api_import and not has_api_import:
            # Add after first import
            import_match = re.search(r'import .+ from ["\'].+["\'];', content)
            if import_match:
                end = import_match.end()
                content = content[:end] + '\nimport { API_URL } from "@/lib/api";' + content[end:]
            else:
                # Add after "use client"
                use_client_match = re.search(r'"use client";', content)
                if use_client_match:
                    end = use_client_match.end()
                    content = content[:end] + '\nimport { API_URL } from "@/lib/api";' + content[end:]
                else:
                    content = 'import { API_URL } from "@/lib/api";\n' + content
        
        # Special case for files that already use 'API' instead of 'API_URL'
        if 'const API =' in original_content:
             content = content.replace('API_URL', 'API')

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

# Files identified in grep
files_to_fix = [
    r"lib\socket.ts",
    r"components\voice\VoiceRoom.tsx",
    r"app\dashboard\system-design\page.tsx",
    r"app\dashboard\youtube-learning\page.tsx",
    r"app\dashboard\history\page.tsx",
    r"app\dashboard\billing\page.tsx",
    r"app\dashboard\api-status\page.tsx",
    r"app\admin\page.tsx",
    r"app\api\health\route.ts",
    r"app\api\cron\route.ts",
    r"components\DebugPanel.tsx",
    r"components\AnnouncementBanner.tsx",
    r"components\dashboard\Sidebar.tsx",
]

for rel_path in files_to_fix:
    full_path = os.path.join(FRONTEND_DIR, rel_path)
    if os.path.exists(full_path):
        if standardize_file(full_path):
            print(f"Fixed: {rel_path}")
        else:
            print(f"No changes needed: {rel_path}")
    else:
        print(f"File not found: {rel_path}")

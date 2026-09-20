import os

def insert_jarvis(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Import JarvisAssistant
    if 'import JarvisAssistant' not in content:
        content = content.replace(
            'import { DailyLearningWidget } from "@/components/dashboard/DailyLearningWidget";',
            'import { DailyLearningWidget } from "@/components/dashboard/DailyLearningWidget";\nimport JarvisAssistant from "@/components/dashboard/JarvisAssistant";'
        )

    # Insert below the welcome header (approx line ~170, but we'll find "<div className=\"max-w-7xl mx-auto space-y-12\">")
    if '<JarvisAssistant />' not in content:
        content = content.replace(
            '<div className="max-w-7xl mx-auto space-y-12">',
            '<div className="max-w-7xl mx-auto space-y-12">\n        <JarvisAssistant />'
        )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {filepath}")

insert_jarvis('frontend/src/app/dashboard/student/page.tsx')
insert_jarvis('frontend/src/app/dashboard/professional/page.tsx')

with open('frontend/src/app/dashboard/focus/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'type State = "focused" | "distracted" | "low engagement" | "neutral" | "uncertain";',
    'type State = "focused" | "distracted" | "low engagement" | "neutral" | "uncertain" | "camera_unavailable" | "no_face_detected";'
)

with open('frontend/src/app/dashboard/focus/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

with open('frontend/src/components/dashboard/JarvisAssistant.tsx', 'r', encoding='utf-8') as f:
    j_content = f.read()

j_content = j_content.replace(
    'import { useAuth } from "@/hooks/useAuth";',
    '// import { useAuth } from "@/hooks/useAuth";'
)
j_content = j_content.replace(
    'const { token } = useAuth();',
    'const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;'
)

with open('frontend/src/components/dashboard/JarvisAssistant.tsx', 'w', encoding='utf-8') as f:
    f.write(j_content)
    
print("Fixed both issues")

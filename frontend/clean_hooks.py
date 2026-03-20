import os
import glob
import re

path = 'c:/Users/Admin/Downloads/Desktop/Project/TulasiAI/frontend/src/app/dashboard/**/*.tsx'
files = glob.glob(path, recursive=True)

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    original = content
    # Replace useToken() calls with empty string to avoid ReferenceErrors for 'token'
    content = re.sub(r'const\s+token\s*=\s*useToken\(\)\s*;?', 'const token = "";', content)
    # Remove the import line
    content = re.sub(r'import\s+\{\s*useToken\s*\}\s*from\s+[\"\'\']@/hooks/useToken[\"\'\']\s*;?\n?', '', content)
    
    if content != original:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f'Fixed hooks in: {f}')
print('Done.')

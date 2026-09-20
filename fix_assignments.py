import os
import re

def fix_assignments(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if not file.endswith('.py'):
                continue
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Pattern matches (user.profile.FIELD if getattr(user, "profile", None) else "") = value
            # and changes it to:
            # if user.profile: user.profile.FIELD = value
            # This is hard to do with regex perfectly due to indentation, so we'll just fix assignments by reverting and replacing properly.
            
            # Let's find all assignments to the bad conditional expression.
            # Regex: `^\s*\((\w+)\.profile\.([a-zA-Z_0-9]+)\s+if\s+getattr\(\1,\s*"profile",\s*None\)\s+else\s+"[^"]*"\)\s*=\s*(.*)$`
            
            lines = content.split('\n')
            new_lines = []
            changed = False
            for line in lines:
                match = re.search(r'^(\s*)\((\w+)\.profile\.([a-zA-Z_0-9]+)\s+if\s+getattr\(\2,\s*"profile",\s*None\)\s+else\s+.*?\)\s*=\s*(.*)$', line)
                if match:
                    indent = match.group(1)
                    var = match.group(2)
                    field = match.group(3)
                    value = match.group(4)
                    
                    new_lines.append(f"{indent}if {var}.profile:")
                    new_lines.append(f"{indent}    {var}.profile.{field} = {value}")
                    changed = True
                else:
                    new_lines.append(line)
                    
            if changed:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write('\n'.join(new_lines))
                print(f"Fixed {path}")

fix_assignments('backend/app/api')
fix_assignments('backend/app/services')

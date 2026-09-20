import os
import re

def replace_user_fields(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if not file.endswith('.py'):
                continue
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()

            new_content = content
            
            patterns = [
                ('skills', '""'),
                ('target_role', '""'),
                ('department', '""'),
                ('bio', '""'),
                ('target_companies', '""'),
                ('interest_areas', '""'),
                ('user_intelligence_profile', '"{}"'),
                ('behavioral_patterns', '"{}"')
            ]
            
            for field, default in patterns:
                # E.g. match user.skills but not user.profile.skills
                regex = r'(?<!profile\.)\b([a-zA-Z_0-9]+)\.' + field + r'\b'
                # Replace with (user.profile.skills if getattr(user, "profile", None) else "")
                replacement = r'(\1.profile.' + field + r' if getattr(\1, "profile", None) else ' + default + r')'
                new_content = re.sub(regex, replacement, new_content)
                
            # Handle assignments: user.skills = value -> if not user.profile: user.profile = Profile(); user.profile.skills = value
            # This is complex to regex, so I'll handle assignments in a second pass where needed or manually
            
            if new_content != content:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f'Updated {path}')

replace_user_fields('backend/app/api')
replace_user_fields('backend/app/services')

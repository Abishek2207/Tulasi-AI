"""
Repair notifications_api.py:
- UserTypeEnum.STUDENT == 'STUDENT' but User.user_type is stored as lowercase 'student'.
  Fix by using case-insensitive comparison with canonical stored values.
- Also note: PROFESSIONAL_REMINDERS is referenced but may not be defined — check and handle.
"""

with open('backend/app/api/notifications_api.py', 'r', encoding='utf-8') as f:
    content = f.read()

original = content

# Fix the broken comparison: UserTypeEnum.STUDENT vs stored lowercase "student"
# Use .upper() on the stored value to match the enum, which is how other files handle it
content = content.replace(
    '    if current_user.user_type == UserTypeEnum.STUDENT:',
    '    if (current_user.user_type or "").upper() == UserTypeEnum.STUDENT:'
)
content = content.replace(
    '    elif current_user.user_type == UserTypeEnum.PROFESSIONAL:',
    '    elif (current_user.user_type or "").upper() == UserTypeEnum.PROFESSIONAL:'
)

if content != original:
    print("✅ Fixed UserTypeEnum comparison to be case-insensitive")
else:
    print("⚠️  No changes made to UserTypeEnum comparison")

# Check if PROFESSIONAL_REMINDERS is defined
if 'PROFESSIONAL_REMINDERS' in content and 'PROFESSIONAL_REMINDERS = [' not in content:
    print("⚠️  PROFESSIONAL_REMINDERS referenced but not defined — adding empty list")
    # Insert it after STUDENT_REMINDERS block
    content = content.replace(
        '\n@router.get("")',
        '\nPROFESSIONAL_REMINDERS = []\n\n@router.get("")'
    )

with open('backend/app/api/notifications_api.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ notifications_api.py repaired")

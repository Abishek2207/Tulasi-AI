with open('backend/app/api/streak_api.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Add import for notifications
if 'from app.api.notifications_api import create_notification_if_not_exists' not in content:
    content = content.replace(
        'from app.api.activity import log_activity_internal',
        'from app.api.activity import log_activity_internal\nfrom app.api.notifications_api import create_notification_if_not_exists'
    )

old_str = 'milestone = _check_milestone(current_user.streak)'
new_str = '''milestone = _check_milestone(current_user.streak)
    if milestone:
        create_notification_if_not_exists(
            db=db, 
            user_id=current_user.id, 
            title=f"Milestone Unlocked: {milestone['badge']}", 
            message=f"You hit a {milestone['streak']}-day streak! Amazing dedication.", 
            category="Milestone"
        )'''
        
if old_str in content and new_str not in content:
    content = content.replace(old_str, new_str)

with open('backend/app/api/streak_api.py', 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated streak_api.py with milestone notifications')

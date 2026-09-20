with open('backend/app/api/router.py', 'r', encoding='utf-8') as f:
    content = f.read()

if 'jarvis_api' not in content:
    content = content.replace(
        'from app.api import (',
        'from app.api import (\n    jarvis_api,'
    )
    content = content.replace(
        '# Main API',
        '# Main API\napi_router.include_router(jarvis_api.router, prefix="/api/jarvis", tags=["Jarvis Intelligence"])'
    )
    with open('backend/app/api/router.py', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Added jarvis_api to router.py')
else:
    print('jarvis_api already in router.py')

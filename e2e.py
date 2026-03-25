import requests
import uuid
import sys
import json
import time

BASE_URL = 'https://tulasiai.up.railway.app/api'

report = {
    'working': [],
    'failed': [],
    'fixes': []
}

def log_success(name):
    print(f'✅ {name}')
    report['working'].append(name)

def log_failure(name, reason, fix=None):
    print(f'❌ {name}: {reason}')
    report['failed'].append(f'{name} ({reason})')
    if fix:
        report['fixes'].append(fix)

def test_health():
    try:
        r = requests.get(f'{BASE_URL}/health', timeout=10)
        if r.status_code == 200:
            log_success('API Health Check')
            return True
        log_failure('API Health Check', f'Status {r.status_code}')
    except Exception as e:
        log_failure('API Health Check', str(e), 'Check if Railway instance is reachable.')
    return False

def test_auth():
    uid = uuid.uuid4().hex[:8]
    email = f'test_{uid}@example.com'
    pwd = 'password123'
    
    # Register
    try:
        r = requests.post(f'{BASE_URL}/auth/register', json={'email': email, 'password': pwd, 'name': 'E2E Tester'}, timeout=15)
        if r.status_code != 200:
            log_failure('Auth Register', f'Status {r.status_code}: {r.text}')
            return None
        log_success('Auth Register')
    except Exception as e:
        log_failure('Auth Register', str(e))
        return None
        
    # Login
    try:
        r = requests.post(f'{BASE_URL}/auth/login', json={'email': email, 'password': pwd}, timeout=10)
        if r.status_code == 200:
            log_success('Auth Login')
            return r.json().get('access_token')
        else:
            log_failure('Auth Login', f'Status {r.status_code}: {r.text}')
    except Exception as e:
        log_failure('Auth Login', str(e))
    return None

def main():
    print('Starting E2E Production Tests...')
    if not test_health():
        print('Backend is unreachable. Aborting further tests.')
        return
        
    token = test_auth()
    if not token:
        print('Auth failed. Cannot proceed with authenticated endpoints.')
        return
        
    headers = {'Authorization': f'Bearer {token}'}

    # Hackathons
    try:
        r = requests.get(f'{BASE_URL}/hackathons', timeout=10)
        if r.status_code == 200:
            log_success('Hackathons API')
        else:
            log_failure('Hackathons API', f'Status {r.status_code}: {r.text}')
    except Exception as e:
        log_failure('Hackathons API', str(e))

    # Roadmaps
    try:
        r = requests.get(f'{BASE_URL}/roadmap/', headers=headers, timeout=10)
        if r.status_code == 200:
            log_success('Roadmaps API')
        else:
            log_failure('Roadmaps API', f'Status {r.status_code}: {r.text}')
    except Exception as e:
        log_failure('Roadmaps API', str(e))
        
    # Code Execution
    try:
        code_payload = {'language': 'python', 'code': 'print("E2E Test")', 'stdin': ''}
        r = requests.post(f'{BASE_URL}/code/run', json=code_payload, headers=headers, timeout=15)
        if r.status_code == 200 and 'E2E Test' in r.json().get('output', ''):
            log_success('Code Execution Engine')
        else:
            log_failure('Code Execution Engine', f'Status {r.status_code}: {r.text}')
    except Exception as e:
        log_failure('Code Execution Engine', str(e))

    # Chat
    try:
        r = requests.post(f'{BASE_URL}/chat', json={'message': 'Reply with the word SUCCESS', 'session_id': ''}, headers=headers, timeout=20)
        if r.status_code == 200:
            log_success('AI Chat Engine')
        else:
            log_failure('AI Chat Engine', f'Status {r.status_code}: {r.text}')
    except Exception as e:
        log_failure('AI Chat Engine', f'Status {r.status_code}: {r.text}', 'Check if GOOGLE_API_KEY is valid on Railway.')

    print('\n--- E2E Report ---')
    print(json.dumps(report, indent=2))

if __name__ == '__main__':
    main()

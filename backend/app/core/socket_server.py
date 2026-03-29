import socketio
import os
from app.api.deps import get_user_from_token
from app.core.database import SessionLocal

sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins="*"
)

# Socket.io ASGI App
socket_app = socketio.ASGIApp(sio)

# Mapping of user_id to sid for direct messaging
user_to_sid = {}

@sio.event
async def connect(sid, environ, auth=None):
    # Try to get token from auth or query string
    token = None
    if auth and isinstance(auth, dict):
        token = auth.get('token')
    
    if not token:
        # Fallback to query string
        from urllib.parse import parse_qs
        query_string = environ.get('QUERY_STRING', '')
        params = parse_qs(query_string)
        token = params.get('token', [None])[0]

    if not token:
        print(f"Connection rejected: No token provided for sid {sid}")
        return False # Disconnect
    
    db = SessionLocal()
    try:
        user = await get_user_from_token(token, db)
        if not user:
            print(f"Connection rejected: Invalid token for sid {sid}")
            return False
        
        # Track user session
        user_to_sid[user.id] = sid
        await sio.save_session(sid, {'user_id': user.id})
        print(f"✅ User {user.id} ({user.email}) connected via Socket.io (sid: {sid})")
        
        # Join global community room
        await sio.enter_room(sid, 'community')
        
    finally:
        db.close()

@sio.event
async def disconnect(sid):
    session = await sio.get_session(sid)
    user_id = session.get('user_id')
    if user_id and user_to_sid.get(user_id) == sid:
        del user_to_sid[user_id]
        print(f"❌ User {user_id} disconnected (sid: {sid})")

@sio.event
async def join_group(sid, data):
    group_id = data.get('group_id')
    if group_id:
        room_name = f"group_{group_id}"
        await sio.enter_room(sid, room_name)
        print(f"Sid {sid} joined group room: {room_name}")

@sio.event
async def leave_group(sid, data):
    group_id = data.get('group_id')
    if group_id:
        room_name = f"group_{group_id}"
        await sio.leave_room(sid, room_name)

@sio.event
async def typing(sid, data):
    group_id = data.get('group_id')
    is_typing = data.get('is_typing')
    session = await sio.get_session(sid)
    user_id = session.get('user_id')
    
    if group_id and user_id:
        # Get user info from DB or use a cached name (better to use session)
        # For speed, we emit back the user_id and is_typing
        await sio.emit('user_typing', {
            'user_id': user_id,
            'is_typing': is_typing,
            'group_id': group_id
        }, room=f"group_{group_id}", skip_sid=sid)

# Helper to send direct message
async def push_direct_message(receiver_id, message_data):
    sid = user_to_sid.get(receiver_id)
    if sid:
        await sio.emit('new_direct_message', message_data, to=sid)
        return True
    return False

# Helper to broadcast group message
async def broadcast_group_message(group_id, message_data):
    await sio.emit('new_group_message', message_data, room=f"group_{group_id}")

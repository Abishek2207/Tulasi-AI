import socketio
import os
from app.api.deps import get_user_from_token
from app.core.database import engine
from sqlmodel import Session, select
from datetime import datetime, timezone

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
    
    db = Session(engine)
    try:
        user = await get_user_from_token(token, db)
        if not user:
            print(f"Connection rejected: Invalid token for sid {sid}")
            return False
        
        # Track user session
        user_to_sid[user.id] = sid
        await sio.save_session(sid, {'user_id': user.id})
        print(f"✅ User {user.id} ({user.email}) connected via Socket.io (sid: {sid})")
        
        # Join global community and feed rooms
        await sio.enter_room(sid, 'community')
        await sio.enter_room(sid, 'feed')
        
        # Update last_seen and broadcast status
        user.last_seen = datetime.now(timezone.utc)
        db.add(user)
        db.commit()
        
        await sio.emit('user_status_change', {
            'user_id': user.id,
            'is_online': True,
            'last_seen': user.last_seen.isoformat()
        }, room='community', skip_sid=sid)
        
    finally:
        db.close()

@sio.event
async def disconnect(sid):
    session = await sio.get_session(sid)
    user_id = session.get('user_id')
    if user_id and user_to_sid.get(user_id) == sid:
        del user_to_sid[user_id]
        print(f"❌ User {user_id} disconnected (sid: {sid})")
        
        # Broadcast offline status
        now = datetime.now(timezone.utc)
        await sio.emit('user_status_change', {
            'user_id': user_id,
            'is_online': False,
            'last_seen': now.isoformat()
        }, room='community')
        
        # Update last_seen in DB
        db = Session(engine)
        try:
            from app.models.models import User as DBUser
            user = db.get(DBUser, user_id)
            if user:
                user.last_seen = now
                db.add(user)
                db.commit()
        finally:
            db.close()

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
    receiver_id = data.get('receiver_id')
    is_typing = data.get('is_typing', True)
    group_id = data.get('group_id')
    session = await sio.get_session(sid)
    user_id = session.get('user_id')
    
    if user_id:
        if group_id:
            await sio.emit('user_typing', {
                'user_id': user_id,
                'is_typing': is_typing,
                'group_id': group_id
            }, room=f"group_{group_id}", skip_sid=sid)
        elif receiver_id:
            target_sid = user_to_sid.get(receiver_id)
            if target_sid:
                await sio.emit('user_typing', {
                    'user_id': user_id,
                    'is_typing': is_typing,
                    'receiver_id': receiver_id
                }, to=target_sid)

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

@sio.event
async def webrtc_signal(sid, data):
    # Data should contain target_user_id and signaling payload
    target_user_id = data.get('target_user_id')
    signal_type = data.get('type') # call_request, call_accept, call_reject, call_end, offer, answer, ice_candidate
    payload = data.get('payload', {})
    
    session = await sio.get_session(sid)
    caller_id = session.get('user_id')
    
    if target_user_id and caller_id:
        # Resolve target sid
        target_sid = user_to_sid.get(target_user_id)
        if target_sid:
            # Forward the signal to target user
            await sio.emit('webrtc_signal', {
                'sender_id': caller_id,
                'type': signal_type,
                'payload': payload
            }, to=target_sid)

@sio.event
async def ping_keepalive(sid):
    # Extremely lightweight pong to prevent server sleep
    await sio.emit('pong_keepalive', {'status': 'active'}, to=sid)



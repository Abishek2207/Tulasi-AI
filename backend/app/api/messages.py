from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, UploadFile, File
from sqlmodel import Session, select, or_, and_
from typing import List, Dict, Optional
from pydantic import BaseModel
import json
import asyncio
import os
import shutil
import uuid
from datetime import datetime, timezone

from app.models.models import User, DirectMessage, ChatRequest
from app.api.deps import get_current_user, get_user_from_token
from app.api.activity import log_activity_internal
from app.core.database import get_session

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        self.active_connections.pop(user_id, None)

    async def send_personal_message(self, message: dict, user_id: int):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_json(message)

manager = ConnectionManager()

class MessageSend(BaseModel):
    receiver_id: int
    content: str
    media_type: Optional[str] = None
    media_url: Optional[str] = None
    reply_to_id: Optional[int] = None

class RequestHandle(BaseModel):
    sender_id: int
    action: str # accept | reject | block

@router.post("")
async def send_message(req: MessageSend, current_user: User = Depends(get_current_user), db: Session = Depends(get_session)):
    # ── 🚨 Blocked Check ──────────────────────────────────────────
    block_check = db.exec(select(ChatRequest).where(
        and_(ChatRequest.sender_id == current_user.id, ChatRequest.receiver_id == req.receiver_id, ChatRequest.status == "blocked")
    )).first()
    if block_check: raise HTTPException(403, "You are blocked by this user")
    
    # Check if a chat request exists
    request = db.exec(select(ChatRequest).where(
        or_(
            and_(ChatRequest.sender_id == current_user.id, ChatRequest.receiver_id == req.receiver_id),
            and_(ChatRequest.sender_id == req.receiver_id, ChatRequest.receiver_id == current_user.id)
        )
    )).first()
    
    if not request:
        # First time message: create a pending request
        request = ChatRequest(sender_id=current_user.id, receiver_id=req.receiver_id, status="pending")
        db.add(request)
        db.commit()

    # Create the direct message
    msg = DirectMessage(
        sender_id=current_user.id,
        receiver_id=req.receiver_id,
        content=req.content,
        media_type=req.media_type,
        media_url=req.media_url,
        reply_to_id=req.reply_to_id,
        reactions_json="[]",
        created_at=datetime.now(timezone.utc)
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    
    # ── 💬 Log Activity ───────────────────────────────────────────
    log_activity_internal(current_user, db, "message_sent", f"Sent a direct message")
    db.commit()
    # ─────────────────────────────────────────────────────────────
    
    # Notify recipient via Socket.io if online
    from app.core.socket_server import push_direct_message
    
    msg_dict = {
        "id": msg.id,
        "sender_id": msg.sender_id,
        "receiver_id": msg.receiver_id,
        "content": msg.content,
        "media_type": msg.media_type,
        "media_url": msg.media_url,
        "reply_to_id": msg.reply_to_id,
        "reactions": json.loads(msg.reactions_json or "[]"),
        "is_seen": msg.is_seen,
        "seen_at": msg.seen_at.isoformat() if msg.seen_at else None,
        "created_at": msg.created_at.isoformat() if hasattr(msg.created_at, "isoformat") else str(msg.created_at)
    }
    
    await push_direct_message(req.receiver_id, {"type": "new_message", "message": msg_dict})
    
    return {"status": "success", "message": msg_dict, "request_status": request.status}


@router.get("/requests/status/{other_user_id}")
def get_request_status(other_user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_session)):
    request = db.exec(select(ChatRequest).where(
        or_(
            and_(ChatRequest.sender_id == current_user.id, ChatRequest.receiver_id == other_user_id),
            and_(ChatRequest.sender_id == other_user_id, ChatRequest.receiver_id == current_user.id)
        )
    )).first()
    
    return {
        "status": request.status if request else "none",
        "is_initiator": request.sender_id == current_user.id if request else False
    }


@router.post("/requests/handle")
def handle_request(req: RequestHandle, current_user: User = Depends(get_current_user), db: Session = Depends(get_session)):
    request = db.exec(select(ChatRequest).where(
        and_(ChatRequest.sender_id == req.sender_id, ChatRequest.receiver_id == current_user.id)
    )).first()
    
    if not request:
        # Create one if missing (e.g. blocking someone before they message)
        request = ChatRequest(sender_id=req.sender_id, receiver_id=current_user.id)
        
    request.status = req.action
    request.updated_at = datetime.now(timezone.utc)
    db.add(request)
    db.commit()
    
    return {"status": "success", "new_status": req.action}

@router.patch("/seen/{sender_id}")
async def mark_as_seen(sender_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_session)):
    messages = db.exec(select(DirectMessage).where(
        and_(DirectMessage.sender_id == sender_id, DirectMessage.receiver_id == current_user.id, DirectMessage.is_seen == False)
    )).all()
    
    if not messages:
        return {"status": "success", "count": 0}
        
    now = datetime.now(timezone.utc)
    for m in messages:
        m.is_seen = True
        m.seen_at = now
        db.add(m)
    
    db.commit()
    
    # Notify the sender that their messages were seen
    from app.core.socket_server import sio, user_to_sid
    sender_sid = user_to_sid.get(sender_id)
    if sender_sid:
        await sio.emit('message_seen', {
            'receiver_id': current_user.id,
            'seen_at': now.isoformat()
        }, to=sender_sid)
        
    return {"status": "success", "count": len(messages)}

MEDIA_DIR = "data/chat_media"

@router.post("/upload")
async def upload_chat_media(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Upload a chat attachment (image/audio)."""
    allowed_types = {
        "image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif",
        "audio/mpeg", "audio/wav", "audio/webm", "audio/ogg", "audio/mp4"
    }
    if file.content_type not in allowed_types:
        raise HTTPException(400, f"Unsupported file type: {file.content_type}")

    os.makedirs(MEDIA_DIR, exist_ok=True)
    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "dat"
    filename = f"{current_user.id}_{uuid.uuid4().hex[:8]}.{ext}"
    file_path = os.path.join(MEDIA_DIR, filename)

    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # Return the relative path for use in media_url
    media_type = "image" if file.content_type.startswith("image/") else "audio"
    return {
        "status": "success",
        "media_url": f"data/chat_media/{filename}",
        "media_type": media_type
    }

@router.delete("/{message_id}")
async def delete_message(message_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_session)):
    msg = db.get(DirectMessage, message_id)
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    
    if msg.sender_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own messages")
    
    receiver_id = msg.receiver_id
    db.delete(msg)
    db.commit()
    
    # Notify the recipient via socket to remove the message from their UI
    from app.core.socket_server import sio, user_to_sid
    target_sid = user_to_sid.get(receiver_id)
    if target_sid:
        await sio.emit('message_deleted', {
            'message_id': message_id,
            'sender_id': current_user.id
        }, to=target_sid)
        
    return {"status": "success", "message_id": message_id}

@router.websocket("/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str, db: Session = Depends(get_session)):
    user = await get_user_from_token(token, db)
    if not user:
        await websocket.close(code=4003)
        return

    await manager.connect(user.id, websocket)
    try:
        while True:
            # Just keep connection alive and wait for disconnect
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(user.id)

@router.get("/{other_user_id}")
def get_conversation(other_user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_session)):
    statement = select(DirectMessage).where(
        or_(
            and_(DirectMessage.sender_id == current_user.id, DirectMessage.receiver_id == other_user_id),
            and_(DirectMessage.sender_id == other_user_id, DirectMessage.receiver_id == current_user.id)
        )
    ).order_by(DirectMessage.created_at)
    
    messages = db.exec(statement).all()
    return {"messages": messages}

@router.get("/users/directory")
def get_user_directory(current_user: User = Depends(get_current_user), db: Session = Depends(get_session)):
    from datetime import datetime, timedelta
    from app.core.socket_server import user_to_sid
    
    statement = select(User).where(User.id != current_user.id).limit(100)
    users = db.exec(statement).all()
    
    # Get request statuses for all these users
    requests = db.exec(select(ChatRequest).where(
        or_(ChatRequest.sender_id == current_user.id, ChatRequest.receiver_id == current_user.id)
    )).all()
    
    request_map = {}
    for r in requests:
        other_id = r.receiver_id if r.sender_id == current_user.id else r.sender_id
        request_map[other_id] = r
    
    five_mins_ago = datetime.now(timezone.utc) - timedelta(minutes=5)
    
    user_list = []
    for u in users:
        req = request_map.get(u.id)
        status = req.status if req else "none"
        is_initiator = req.sender_id == current_user.id if req else False
        
        # Real-time online check
        is_online = u.id in user_to_sid or (u.last_seen > five_mins_ago if u.last_seen else False)
        
        # Get last message
        last_msg = db.exec(select(DirectMessage).where(
            or_(
                and_(DirectMessage.sender_id == current_user.id, DirectMessage.receiver_id == u.id),
                and_(DirectMessage.sender_id == u.id, DirectMessage.receiver_id == current_user.id)
            )
        ).order_by(DirectMessage.created_at.desc())).first()
        
        user_list.append({
            "id": u.id, 
            "name": u.name or u.email.split("@")[0], 
            "email": u.email, 
            "avatar": u.avatar,
            "role": u.role,
            "last_seen": u.last_seen.isoformat() if u.last_seen else None,
            "is_online": is_online,
            "request_status": status,
            "is_initiator": is_initiator,
            "last_message": {
                "content": last_msg.content if last_msg else None,
                "media_type": last_msg.media_type if last_msg else None,
                "created_at": last_msg.created_at.isoformat() if last_msg else None,
                "sender_id": last_msg.sender_id if last_msg else None
            } if last_msg else None
        })
        
    return {"users": user_list}

@router.get("/search")
def search_users(q: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_session)):
    """Search for users by name or email to start a conversation."""
    if not q or len(q) < 2:
        return {"users": []}
    
    query = select(User).where(
        and_(
            User.id != current_user.id,
            or_(
                User.name.ilike(f"%{q}%"),
                User.email.ilike(f"%{q}%"),
                User.target_role.ilike(f"%{q}%"),
                User.interest_areas.ilike(f"%{q}%")
            )
        )
    ).limit(20)
    
    users = db.exec(query).all()
    return {"users": [
        {
            "id": u.id, 
            "name": u.name or u.email.split("@")[0], 
            "email": u.email,
            "target_role": u.target_role,
            "interest_areas": u.interest_areas,
            "level": u.level,
            "is_pro": u.is_pro
        } for u in users
    ]}
def _get_user_directory_internal(current_user: User, db: Session):
    # (Existing internal logic if any, otherwise just use the endpoint)
    pass

@router.patch("/{message_id}/react")
async def toggle_reaction(
    message_id: int, 
    emoji: str, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_session)
):
    msg = db.get(DirectMessage, message_id)
    if not msg: raise HTTPException(404, "Message not found")
    
    reactions = json.loads(msg.reactions_json or "[]")
    
    # Check if user already reacted with this emoji
    existing = next((r for r in reactions if r["user_id"] == current_user.id and r["emoji"] == emoji), None)
    
    if existing:
        reactions = [r for r in reactions if not (r["user_id"] == current_user.id and r["emoji"] == emoji)]
    else:
        # Add reaction
        reactions.append({
            "user_id": current_user.id, 
            "emoji": emoji, 
            "user_name": current_user.name or current_user.email.split("@")[0]
        })
        
    msg.reactions_json = json.dumps(reactions)
    db.add(msg)
    db.commit()
    
    # Broadcast reaction to both participants
    from app.core.socket_server import sio, user_to_sid
    for uid in [msg.sender_id, msg.receiver_id]:
        sid = user_to_sid.get(uid)
        if sid:
            await sio.emit("message_reaction", {
                "message_id": message_id,
                "reactions": reactions
            }, to=sid)
            
    return {"status": "success", "reactions": reactions}

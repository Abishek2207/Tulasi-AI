"""
WebSocket Chat Endpoint — /ws/chat

Features:
  - JWT-authenticated WebSocket connection
  - AI-powered responses via get_ai_response()
  - Heartbeat ping every 30s
  - Reconnect handled client-side (backend is stateless per session)
  - Broadcast support for multi-user rooms
"""

from __future__ import annotations

import json
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from jose import JWTError, jwt

from app.core.config import settings
from app.core.ai_router import get_ai_response
from app.websockets.manager import manager

router = APIRouter()


async def _authenticate_ws(token: str) -> dict | None:
    """Validate JWT token for WebSocket connections. Returns payload or None."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None


@router.websocket("/ws/chat")
async def websocket_chat(
    websocket: WebSocket,
    token: str = Query(..., description="JWT access token"),
    room_id: str = Query(default="global", description="Chat room identifier"),
):
    """
    Real-time WebSocket chat endpoint.

    Protocol:
      Client → Server  { "type": "message", "content": "Hello" }
      Server → Client  { "type": "response", "content": "...", "model": "..." }
      Server → Client  { "type": "ping", "timestamp": 123456 }
      Client → Server  { "type": "pong" }
      Server → Client  { "type": "error", "message": "..." }
    """
    # Authenticate
    payload = await _authenticate_ws(token)
    if payload is None:
        await websocket.accept()
        await websocket.send_json({"type": "error", "message": "Invalid or expired token"})
        await websocket.close(code=4001)
        return

    user_id = payload.get("sub", "unknown")
    await manager.connect(websocket, room_id)

    # Send welcome frame
    await manager.send_personal(
        {
            "type": "connected",
            "message": f"Connected to Tulasi AI chat (room: {room_id})",
            "user_id": user_id,
        },
        websocket,
    )

    # Start background heartbeat task
    async def heartbeat():
        import time
        while True:
            await asyncio.sleep(30)
            try:
                await websocket.send_json({"type": "ping", "timestamp": time.time()})
            except Exception:
                break

    heartbeat_task = asyncio.create_task(heartbeat())

    try:
        while True:
            raw = await websocket.receive_text()

            # Parse incoming message
            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                await manager.send_personal(
                    {"type": "error", "message": "Invalid JSON payload"}, websocket
                )
                continue

            msg_type = data.get("type", "message")

            # Handle pong (client response to ping)
            if msg_type == "pong":
                continue

            # Handle chat message
            if msg_type == "message":
                content = data.get("content", "").strip()
                if not content:
                    await manager.send_personal(
                        {"type": "error", "message": "Empty message"}, websocket
                    )
                    continue

                # Acknowledge receipt
                await manager.send_personal(
                    {"type": "ack", "status": "processing"}, websocket
                )

                # Run AI response in thread pool to avoid blocking event loop
                loop = asyncio.get_event_loop()
                ai_reply = await loop.run_in_executor(
                    None,
                    get_ai_response,
                    f"You are Tulasi AI, a helpful learning assistant. {content}",
                )

                # Send AI response back to this client
                await manager.send_personal(
                    {
                        "type": "response",
                        "content": ai_reply,
                        "role": "assistant",
                    },
                    websocket,
                )

            else:
                await manager.send_personal(
                    {"type": "error", "message": f"Unknown message type: {msg_type}"},
                    websocket,
                )

    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"⚠️ WebSocket error (user={user_id}): {e}")
    finally:
        heartbeat_task.cancel()
        manager.disconnect(websocket, room_id)


@router.websocket("/ws/groups/{group_id}")
async def websocket_group_chat(
    websocket: WebSocket,
    group_id: int,
    token: str = Query(..., description="JWT access token"),
):
    """
    Real-time Group Chat WebSocket endpoint.
    Broadcasts messages to all members of the group.
    """
    # 1. Authenticate
    payload = await _authenticate_ws(token)
    if not payload:
        await websocket.accept()
        await websocket.send_json({"type": "error", "message": "Invalid token"})
        await websocket.close(code=4001)
        return

    user_id = int(payload.get("sub", 0))
    room_id = f"group_{group_id}"

    # 2. Verify Membership (using a new session)
    from app.core.database import SessionLocal
    from app.models.models import GroupMember, GroupMessage, User

    with SessionLocal() as db:
        member = db.query(GroupMember).filter(
            GroupMember.group_id == group_id, 
            GroupMember.user_id == user_id
        ).first()
        
        if not member:
            await websocket.accept()
            await websocket.send_json({"type": "error", "message": "Not a member of this group"})
            await websocket.close(code=4003)
            return
        
        user = db.query(User).filter(User.id == user_id).first()
        user_name = user.name if user else "Member"

    # 3. Connect to Manager
    await manager.connect(websocket, room_id)

    # 4. Heartbeat
    async def heartbeat():
        import time
        while True:
            await asyncio.sleep(30)
            try:
                await websocket.send_json({"type": "ping", "timestamp": time.time()})
            except: break

    heartbeat_task = asyncio.create_task(heartbeat())

    try:
        # Notify others of presence
        await manager.broadcast({"type": "presence", "user_id": user_id, "status": "online"}, room_id)

        while True:
            raw = await websocket.receive_text()
            data = json.loads(raw)
            msg_type = data.get("type", "message")

            if msg_type == "pong":
                continue

            if msg_type == "message":
                content = data.get("content", "").strip()
                is_encrypted = data.get("is_encrypted", False)
                if not content: continue

                # Persist to DB
                with SessionLocal() as db:
                    new_msg = GroupMessage(
                        group_id=group_id,
                        user_id=user_id,
                        user_name=user_name,
                        content=content,
                        is_encrypted=is_encrypted
                    )
                    db.add(new_msg)
                    db.commit()
                    db.refresh(new_msg)
                    
                    # Broadcast to all in room
                    await manager.broadcast({
                        "id": new_msg.id,
                        "type": "message",
                        "group_id": group_id,
                        "user_id": user_id,
                        "user_name": user_name,
                        "content": content,
                        "is_encrypted": is_encrypted,
                        "created_at": new_msg.created_at.isoformat()
                    }, room_id)

            elif msg_type == "typing":
                await manager.broadcast({
                    "type": "typing",
                    "user_id": user_id,
                    "user_name": user_name,
                    "is_typing": data.get("is_typing", True)
                }, room_id)

    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"⚠️ Group WS error: {e}")
    finally:
        heartbeat_task.cancel()
        manager.disconnect(websocket, room_id)


@router.get("/api/ws/status")
def ws_status():
    """Return current WebSocket connection counts."""
    return {
        "active_connections": manager.get_connection_count(),
        "rooms": {k: len(v) for k, v in manager.active_connections.items()},
    }

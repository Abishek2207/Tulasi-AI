# backend/routers/groups.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List
import json
from supabase import create_client
import os

router = APIRouter()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

# Active connections
rooms: Dict[str, List[WebSocket]] = {}

@router.post("/create")
async def create_room(name: str, subject: str, user_id: str):
    import random
    import string
    invite_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    
    result = supabase.table("group_rooms").insert({
        "name": name,
        "subject": subject,
        "created_by": user_id,
        "invite_code": invite_code
    }).execute()
    
    return {"room": result.data[0], "invite_code": invite_code}

@router.get("/join/{invite_code}")
async def join_room(invite_code: str):
    room = supabase.table("group_rooms").select("*").eq("invite_code", invite_code).single().execute()
    return {"room": room.data}

@router.websocket("/chat/{room_id}")
async def group_chat(websocket: WebSocket, room_id: str):
    await websocket.accept()
    
    if room_id not in rooms:
        rooms[room_id] = []
    rooms[room_id].append(websocket)
    
    try:
        while True:
            data = await websocket.receive_json()
            
            # Save to DB
            supabase.table("group_messages").insert({
                "room_id": room_id,
                "user_id": data["user_id"],
                "content": data["message"]
            }).execute()
            
            # Broadcast to all in room
            for connection in rooms[room_id]:
                if connection != websocket:
                    await connection.send_json(data)
    
    except WebSocketDisconnect:
        rooms[room_id].remove(websocket)

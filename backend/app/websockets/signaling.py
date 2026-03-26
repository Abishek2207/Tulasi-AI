import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List

router = APIRouter()

# active_rooms maps room_id to a list of active websocket connections
active_rooms: Dict[str, List[WebSocket]] = {}

@router.websocket("/ws/{room_id}")
async def signaling_endpoint(websocket: WebSocket, room_id: str):
    await websocket.accept()
    if room_id not in active_rooms:
        active_rooms[room_id] = []
    
    active_rooms[room_id].append(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Broadcast the WebRTC signaling data (offer, answer, ICE candidate)
            # to all OTHER peers in the same room.
            for client in active_rooms.get(room_id, []):
                if client != websocket:
                    await client.send_text(data)
    except WebSocketDisconnect:
        active_rooms[room_id].remove(websocket)
        if not active_rooms[room_id]:
            del active_rooms[room_id]
        # Notify others that a peer left
        for client in active_rooms.get(room_id, []):
            try:
                await client.send_text(json.dumps({"type": "peer_left"}))
            except:
                pass

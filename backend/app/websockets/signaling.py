import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List

router = APIRouter()

# active_rooms maps room_id to a list of dicts: {"ws": WebSocket, "peer_id": str}
active_rooms: Dict[str, List[Dict]] = {}

@router.websocket("/ws/{room_id}")
async def signaling_endpoint(websocket: WebSocket, room_id: str):
    await websocket.accept()
    if room_id not in active_rooms:
        active_rooms[room_id] = []
    
    # We will identify the peer_id later when they send the join message
    client_info = {"ws": websocket, "peer_id": None}
    active_rooms[room_id].append(client_info)
    
    try:
        while True:
            text_data = await websocket.receive_text()
            try:
                data = json.loads(text_data)
                # Capture peer_id if it's a join message
                if data.get("type") == "join" and data.get("from"):
                    client_info["peer_id"] = data.get("from")
            except:
                pass
                
            # Broadcast the WebRTC signaling data to all OTHER peers
            for client in active_rooms.get(room_id, []):
                if client["ws"] != websocket:
                    try:
                        await client["ws"].send_text(text_data)
                    except:
                        pass
    except WebSocketDisconnect:
        if client_info in active_rooms.get(room_id, []):
            active_rooms[room_id].remove(client_info)
        if not active_rooms.get(room_id):
            if room_id in active_rooms:
                del active_rooms[room_id]
        
        # Notify others that a peer left
        if client_info.get("peer_id"):
            for client in active_rooms.get(room_id, []):
                try:
                    await client["ws"].send_text(json.dumps({"type": "peer_left", "from": client_info["peer_id"]}))
                except:
                    pass

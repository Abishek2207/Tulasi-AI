"""
WebSocket Connection Manager for Tulasi AI.

Manages:
  - Active WebSocket connections per user/room
  - Broadcast messages to all connected clients
  - Personal messages to specific connections
  - Heartbeat tracking
"""

from __future__ import annotations

import asyncio
from typing import Dict, List
from fastapi import WebSocket
import json


class ConnectionManager:
    def __init__(self):
        # Maps room_id → list of WebSocket connections
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # Maps WebSocket → last heartbeat timestamp
        self._heartbeat: Dict[WebSocket, float] = {}

    async def connect(self, websocket: WebSocket, room_id: str = "global"):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)
        import time
        self._heartbeat[websocket] = time.time()
        print(f"✅ WebSocket connected | room={room_id} | total={len(self.active_connections[room_id])}")

    def disconnect(self, websocket: WebSocket, room_id: str = "global"):
        room = self.active_connections.get(room_id, [])
        if websocket in room:
            room.remove(websocket)
        self._heartbeat.pop(websocket, None)
        print(f"🔌 WebSocket disconnected | room={room_id} | remaining={len(room)}")

    async def send_personal(self, data: dict, websocket: WebSocket):
        """Send JSON message to a single client."""
        try:
            await websocket.send_json(data)
        except Exception as e:
            print(f"⚠️ Failed to send personal message: {e}")

    async def broadcast(self, data: dict, room_id: str = "global"):
        """Broadcast JSON message to all clients in a room."""
        room = self.active_connections.get(room_id, [])
        dead: List[WebSocket] = []
        for connection in room:
            try:
                await connection.send_json(data)
            except Exception:
                dead.append(connection)
        # Clean up dead connections
        for ws in dead:
            self.disconnect(ws, room_id)

    async def ping_all(self):
        """Send a heartbeat ping to every active connection."""
        import time
        now = time.time()
        for room_id, connections in list(self.active_connections.items()):
            dead: List[WebSocket] = []
            for ws in connections:
                try:
                    await ws.send_json({"type": "ping", "timestamp": now})
                    self._heartbeat[ws] = now
                except Exception:
                    dead.append(ws)
            for ws in dead:
                self.disconnect(ws, room_id)

    def get_connection_count(self) -> int:
        return sum(len(v) for v in self.active_connections.values())


# Singleton instance — imported by main.py and ws.py
manager = ConnectionManager()

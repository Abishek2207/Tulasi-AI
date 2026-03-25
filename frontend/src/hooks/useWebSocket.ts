"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { websocketUrl } from "@/lib/api";

type WSStatus = "connecting" | "open" | "closed" | "error";

interface WSMessage {
  type: string;
  content?: string;
  role?: string;
  message?: string;
  timestamp?: number;
  [key: string]: unknown;
}

interface UseWebSocketOptions {
  /** JWT token for authentication */
  token: string;
  /** Chat room id */
  roomId?: string;
  /** Reconnect after this many ms (default: 3000) */
  reconnectDelay?: number;
  /** Maximum reconnect attempts (default: 10) */
  maxRetries?: number;
  /** Called on each incoming message */
  onMessage?: (msg: WSMessage) => void;
}

/**
 * Custom hook that wraps native WebSocket with:
 *  - Auto-reconnect with exponential backoff
 *  - Heartbeat pong response (every 30s server sends ping)
 *  - Stable sendMessage reference
 */
export function useWebSocket({
  token,
  roomId = "global",
  reconnectDelay = 3000,
  maxRetries = 999999,
  onMessage,
}: UseWebSocketOptions) {
  const [status, setStatus] = useState<WSStatus>("closed");
  const [messages, setMessages] = useState<WSMessage[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const retryCount = useRef(0);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldClose = useRef(false);

  const buildUrl = useCallback((): string => {
    return `${websocketUrl("/ws/chat")}?token=${encodeURIComponent(token)}&room_id=${encodeURIComponent(roomId)}`;
  }, [token, roomId]);

  const connect = useCallback(() => {
    shouldClose.current = false;
    setStatus("connecting");

    const url = buildUrl();
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("open");
      retryCount.current = 0;
    };

    ws.onmessage = (event) => {
      let data: WSMessage;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }

      // Respond to heartbeat pings
      if (data.type === "ping") {
        ws.send(JSON.stringify({ type: "pong" }));
        return;
      }

      setMessages((prev) => [...prev, data]);
      onMessage?.(data);
    };

    ws.onerror = () => {
      setStatus("error");
    };

    ws.onclose = () => {
      setStatus("closed");
      wsRef.current = null;

      if (shouldClose.current) return;

      if (retryCount.current < maxRetries) {
        retryCount.current += 1;
        // Exponential backoff: min 3s, max 30s
        const delay = Math.min(reconnectDelay * 2 ** (retryCount.current - 1), 30_000);
        console.warn(`WebSocket closed. Reconnecting in ${Math.round(delay / 1000)}s... (attempt ${retryCount.current}/${maxRetries})`);
        reconnectTimeout.current = setTimeout(connect, delay);
      } else {
        console.error("WebSocket max reconnect attempts reached.");
        setStatus("error");
      }
    };
  }, [token, roomId, buildUrl, reconnectDelay, maxRetries, onMessage]);

  useEffect(() => {
    connect();
    return () => {
      shouldClose.current = true;
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const sendMessage = useCallback((content: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "message", content }));
      // Optimistically add user message to local state
      setMessages((prev) => [
        ...prev,
        { type: "user_message", content, role: "user" },
      ]);
    } else {
      console.warn("WebSocket not open. Cannot send message.");
    }
  }, []);

  const clearMessages = useCallback(() => setMessages([]), []);

  return { status, messages, sendMessage, clearMessages, reconnect: connect };
}

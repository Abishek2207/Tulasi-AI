"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, PhoneOff, Volume2, VolumeX, Users } from "lucide-react";

interface Peer {
  id: string;
  name?: string;
  stream?: MediaStream;
  muted?: boolean;
}

interface VoiceRoomProps {
  roomId: string;
  userId: string | number;
  userName: string;
  onLeave: () => void;
}

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export default function VoiceRoom({ roomId, userId, userName, onLeave }: VoiceRoomProps) {
  const [peers, setPeers] = useState<Peer[]>([]);
  const [muted, setMuted] = useState(false);
  const [deafened, setDeafened] = useState(false);
  const [connected, setConnected] = useState(false);
  const [joining, setJoining] = useState(true);

  const wsRef = useRef<WebSocket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const myPeerId = useRef<string>(`${userId}-${Date.now()}`);

  // Build the WS URL pointing to the signaling backend
  const getSignalingUrl = () => {
    const base = (process.env.NEXT_PUBLIC_API_URL || "https://tulasi-ai-wgwl.onrender.com")
      .replace("https://", "wss://")
      .replace("http://", "ws://");
    return `${base}/api/voice/signal/ws/${roomId}`;
  };

  const createPeerConnection = useCallback((peerId: string): RTCPeerConnection => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks
    localStreamRef.current?.getTracks().forEach((track) => {
      pc.addTrack(track, localStreamRef.current!);
    });

    // Receive remote audio
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setPeers((prev) =>
        prev.map((p) =>
          p.id === peerId ? { ...p, stream: remoteStream } : p
        )
      );
    };

    // Send ICE candidates through signaling
    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "ice",
            candidate: event.candidate,
            to: peerId,
            from: myPeerId.current,
          })
        );
      }
    };

    pc.onconnectionstatechange = () => {
      if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
        setPeers((prev) => prev.filter((p) => p.id !== peerId));
        peerConnectionsRef.current.delete(peerId);
      }
    };

    peerConnectionsRef.current.set(peerId, pc);
    return pc;
  }, []);

  const handleSignalingMessage = useCallback(
    async (msg: Record<string, unknown>) => {
      const { type, from } = msg as { type: string; from: string };

      if (type === "join") {
        // A new peer joined — create offer
        const name = (msg.name as string) || "Member";
        setPeers((prev) =>
          prev.find((p) => p.id === from) ? prev : [...prev, { id: from, name }]
        );

        const pc = createPeerConnection(from);
        const offer = await pc.createOffer({ offerToReceiveAudio: true });
        await pc.setLocalDescription(offer);
        wsRef.current?.send(
          JSON.stringify({ type: "offer", offer, to: from, from: myPeerId.current, name: userName })
        );
      } else if (type === "offer") {
        const name = (msg.name as string) || "Member";
        setPeers((prev) =>
          prev.find((p) => p.id === from) ? prev : [...prev, { id: from, name }]
        );

        const pc = createPeerConnection(from);
        await pc.setRemoteDescription(
          new RTCSessionDescription(msg.offer as RTCSessionDescriptionInit)
        );
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        wsRef.current?.send(
          JSON.stringify({ type: "answer", answer, to: from, from: myPeerId.current })
        );
      } else if (type === "answer") {
        const pc = peerConnectionsRef.current.get(from);
        if (pc) await pc.setRemoteDescription(new RTCSessionDescription(msg.answer as RTCSessionDescriptionInit));
      } else if (type === "ice") {
        const pc = peerConnectionsRef.current.get(from);
        if (pc && msg.candidate) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(msg.candidate as RTCIceCandidateInit));
          } catch {}
        }
      } else if (type === "peer_left") {
        setPeers((prev) => prev.filter((p) => p.id !== from));
        const pc = peerConnectionsRef.current.get(from);
        if (pc) { pc.close(); peerConnectionsRef.current.delete(from); }
      }
    },
    [createPeerConnection, userName]
  );

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        localStreamRef.current = stream;
      } catch {
        console.warn("Mic access denied — joining muted");
      }

      if (cancelled) return;

      const ws = new WebSocket(getSignalingUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        setJoining(false);
        ws.send(JSON.stringify({ type: "join", from: myPeerId.current, name: userName }));
      };

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          // Only handle messages intended for us
          if (msg.to && msg.to !== myPeerId.current) return;
          handleSignalingMessage(msg);
        } catch {}
      };

      ws.onerror = () => setJoining(false);
      ws.onclose = () => { setConnected(false); };
    };

    init();
    return () => {
      cancelled = true;
      wsRef.current?.close();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      peerConnectionsRef.current.forEach((pc) => pc.close());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const toggleMute = () => {
    setMuted((prev) => {
      const next = !prev;
      localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !next));
      return next;
    });
  };

  const toggleDeafen = () => setDeafened((prev) => !prev);

  const handleLeave = () => {
    wsRef.current?.close();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    peerConnectionsRef.current.forEach((pc) => pc.close());
    onLeave();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      style={{
        background: "linear-gradient(135deg, rgba(16,10,40,0.98) 0%, rgba(30,15,60,0.98) 100%)",
        border: "1px solid rgba(124,58,237,0.3)",
        borderRadius: 20,
        padding: 24,
        marginBottom: 16,
        backdropFilter: "blur(20px)",
        boxShadow: "0 8px 40px rgba(124,58,237,0.2)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 10, height: 10, borderRadius: "50%",
            background: connected ? "#43E97B" : joining ? "#FFD93D" : "#FF6B6B",
            boxShadow: connected ? "0 0 8px #43E97B" : "none",
            animation: connected ? "pulse 2s infinite" : "none"
          }} />
          <span style={{ fontWeight: 800, fontSize: 15, color: "white" }}>
            🎙️ Voice Channel
          </span>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {joining ? "Connecting..." : connected ? "Live" : "Disconnected"}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Users size={14} style={{ color: "var(--text-muted)" }} />
          <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 700 }}>
            {peers.length + 1}
          </span>
        </div>
      </div>

      {/* Participants */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        {/* Self */}
        <PeerAvatar name={userName} isSelf muted={muted} />
        {/* Others */}
        <AnimatePresence>
          {peers.map((peer) => (
            <PeerAvatar key={peer.id} name={peer.name || "Member"} stream={peer.stream} deafened={deafened} />
          ))}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <ControlBtn
          active={muted}
          color="#FF6B6B"
          onClick={toggleMute}
          title={muted ? "Unmute" : "Mute"}
        >
          {muted ? <MicOff size={18} /> : <Mic size={18} />}
        </ControlBtn>

        <ControlBtn
          active={deafened}
          color="#FFD93D"
          onClick={toggleDeafen}
          title={deafened ? "Undeafen" : "Deafen"}
        >
          {deafened ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </ControlBtn>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLeave}
          title="Leave Voice"
          style={{
            background: "linear-gradient(135deg, #FF6B6B, #ff4444)",
            border: "none",
            borderRadius: 12,
            padding: "10px 20px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "white",
            fontWeight: 800,
            fontSize: 13,
            boxShadow: "0 4px 12px rgba(255,107,107,0.4)",
          }}
        >
          <PhoneOff size={16} /> Leave
        </motion.button>
      </div>
    </motion.div>
  );
}

function PeerAvatar({
  name,
  isSelf,
  muted,
  stream,
  deafened,
}: {
  name: string;
  isSelf?: boolean;
  muted?: boolean;
  stream?: MediaStream;
  deafened?: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (stream && audioRef.current && !isSelf) {
      audioRef.current.srcObject = stream;
      audioRef.current.muted = deafened || false;
    }
  }, [stream, deafened, isSelf]);

  const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}
    >
      <div style={{
        width: 52,
        height: 52,
        borderRadius: "50%",
        background: "linear-gradient(135deg, var(--brand-primary), #a78bfa)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 18,
        fontWeight: 900,
        color: "white",
        border: isSelf ? "2px solid rgba(255,255,255,0.3)" : "2px solid transparent",
        position: "relative",
        boxShadow: "0 4px 16px rgba(124,58,237,0.3)",
      }}>
        {initials}
        {muted && (
          <div style={{
            position: "absolute", bottom: -2, right: -2,
            background: "#FF6B6B", borderRadius: "50%",
            width: 18, height: 18,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "2px solid #0a0a0a",
          }}>
            <MicOff size={10} color="white" />
          </div>
        )}
      </div>
      <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, maxWidth: 60, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {isSelf ? "You" : name}
      </span>
      {stream && !isSelf && <audio ref={audioRef} autoPlay playsInline muted={deafened} style={{ display: "none" }} />}
    </motion.div>
  );
}

function ControlBtn({
  children,
  active,
  color,
  onClick,
  title,
}: {
  children: React.ReactNode;
  active?: boolean;
  color: string;
  onClick: () => void;
  title: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      title={title}
      style={{
        background: active ? color : "rgba(255,255,255,0.06)",
        border: `1px solid ${active ? color : "rgba(255,255,255,0.1)"}`,
        borderRadius: 12,
        padding: "10px 16px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: active ? "white" : "var(--text-secondary)",
        transition: "all 0.2s",
        boxShadow: active ? `0 4px 12px ${color}55` : "none",
      }}
    >
      {children}
    </motion.button>
  );
}

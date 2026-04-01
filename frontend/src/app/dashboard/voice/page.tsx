"use client";

import { useEffect, useRef, useState } from "react";
import { websocketUrl } from "@/lib/api";

export default function VoiceRoomPage() {
  const [roomId, setRoomId] = useState("");
  const [inCall, setInCall] = useState(false);
  const [status, setStatus] = useState("Idle");
  const [peers, setPeers] = useState<number>(0);
  
  const localAudioRef = useRef<HTMLAudioElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const localStream = useRef<MediaStream | null>(null);

  const startCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId.trim()) return;
    
    setStatus("Establishing connection...");
    ws.current = new WebSocket(websocketUrl(`/api/voice/signal/ws/${roomId}`));
    
    ws.current.onopen = async () => {
      setStatus("Connected. Requesting microphone...");
      setInCall(true);
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        localStream.current = stream;
        if (localAudioRef.current) localAudioRef.current.srcObject = stream;
        
        initializePeerConnection();
        setStatus("Waiting for someone to join...");
        
        // Broadcast presence
        ws.current?.send(JSON.stringify({ type: "peer_joined" }));
      } catch (err) {
        setStatus("Microphone access denied.");
      }
    };

    ws.current.onmessage = async (event) => {
      const msg = JSON.parse(event.data);
      const pc = peerConnection.current;
      if (!pc) return;

      if (msg.type === "peer_joined") {
        setPeers(1);
        setStatus("Peer joined. Negotiating connection...");
        // I create the offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        ws.current?.send(JSON.stringify({ type: "offer", sdp: offer.sdp }));
      } 
      else if (msg.type === "offer") {
        setPeers(1);
        setStatus("Received call. Connecting...");
        await pc.setRemoteDescription(new RTCSessionDescription({ type: "offer", sdp: msg.sdp }));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        ws.current?.send(JSON.stringify({ type: "answer", sdp: answer.sdp }));
      } 
      else if (msg.type === "answer") {
        setStatus("Call established!");
        await pc.setRemoteDescription(new RTCSessionDescription({ type: "answer", sdp: msg.sdp }));
      } 
      else if (msg.type === "ice-candidate") {
        if (msg.candidate) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
          } catch (e) { console.error("Error adding ICE candidate", e); }
        }
      }
      else if (msg.type === "peer_left") {
        setPeers(0);
        setStatus("Peer left the call.");
      }
    };
  };

  const initializePeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    pc.onicecandidate = (e) => {
      if (e.candidate && ws.current) {
        ws.current.send(JSON.stringify({ type: "ice-candidate", candidate: e.candidate }));
      }
    };

    pc.ontrack = (e) => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = e.streams[0];
        setStatus("Call established! Audio receiving.");
      }
    };

    if (localStream.current) {
      localStream.current.getTracks().forEach(t => pc.addTrack(t, localStream.current!));
    }

    peerConnection.current = pc;
  };

  const leaveCall = () => {
    if (ws.current) ws.current.close();
    if (peerConnection.current) peerConnection.current.close();
    if (localStream.current) localStream.current.getTracks().forEach(t => t.stop());
    setInCall(false);
    setStatus("Idle");
  };

  // Required cleanup
  useEffect(() => {
    return () => leaveCall();
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: 24, background: "var(--surface)", borderRadius: 12 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>🎙️ Voice Rooms</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>End-to-End encrypted WebRTC peer audio streams.</p>
      
      {!inCall ? (
        <form onSubmit={startCall} style={{ display: "flex", gap: 12 }}>
          <input 
            className="input-field" 
            placeholder="Enter Room Code (e.g. 1234)" 
            value={roomId} 
            onChange={e => setRoomId(e.target.value)}
            style={{ flex: 1, padding: "12px 16px", borderRadius: 8 }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: "12px 24px", borderRadius: 8 }}>
            Join Call
          </button>
        </form>
      ) : (
        <div style={{ padding: 24, border: "1px solid var(--border)", borderRadius: 8, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📞</div>
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>Room: {roomId}</h2>
          <div style={{ color: "var(--brand-primary)", fontWeight: 600, marginBottom: 24 }}>{status}</div>
          
          <div style={{ display: "flex", gap: 24, justifyContent: "center", marginBottom: 24 }}>
            <div style={{ padding: 16, background: "rgba(255,255,255,0.05)", borderRadius: 8 }}>
              Local Audio
              <audio ref={localAudioRef} autoPlay muted style={{ display: "block", marginTop: 8 }} />
            </div>
            <div style={{ padding: 16, background: "rgba(255,255,255,0.05)", borderRadius: 8 }}>
              Remote Audio ({peers} peers)
              <audio ref={remoteAudioRef} autoPlay style={{ display: "block", marginTop: 8 }} />
            </div>
          </div>
          
          <button onClick={leaveCall} className="btn bg-red-500 hover:bg-red-600" style={{ background: "#ef4444", color: "white", padding: "12px 24px", borderRadius: 8 }}>
            End Call
          </button>
        </div>
      )}
    </div>
  );
}

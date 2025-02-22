import React, { useState, useRef, useEffect } from "react";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaComments, FaMoon, FaSun } from "react-icons/fa";
import axios from "axios";

const VideoCall = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [roomId, setRoomId] = useState("");
  const [inRoom, setInRoom] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const ws = useRef(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (inRoom) {
      ws.current = new WebSocket(`wss://jarvis-compiler.onrender.com/ws/video/${roomId}/`);

      ws.current.onopen = () => console.log("WebSocket connected.");
      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "offer") handleOffer(data.offer);
        else if (data.type === "answer") handleAnswer(data.answer);
        else if (data.type === "candidate") handleCandidate(data.candidate);
      };
      ws.current.onerror = (error) => console.error("WebSocket error:", error);
      ws.current.onclose = () => console.log("WebSocket closed.");

      setupPeerConnection();
    }

    return () => ws.current && ws.current.close();
  }, [inRoom]);

  const setupPeerConnection = async () => {
    peerConnection.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      stream.getTracks().forEach((track) => peerConnection.current.addTrack(track, stream));

      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) sendMessage({ type: "candidate", candidate: event.candidate });
      };

      peerConnection.current.ontrack = (event) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
      };

      peerConnection.current.onnegotiationneeded = async () => {
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        sendMessage({ type: "offer", offer });
      };
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  const sendMessage = (message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  const handleOffer = async (offer) => {
    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);
    sendMessage({ type: "answer", answer });
  };

  const handleAnswer = async (answer) => {
    if (peerConnection.current.signalingState !== "stable") {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
    }
  };

  const handleCandidate = async (candidate) => {
    if (peerConnection.current.remoteDescription) {
      await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  const toggleMute = () => {
    if (!peerConnection.current) return;
    const audioTrack = peerConnection.current.getSenders().find((s) => s.track.kind === "audio");
    if (audioTrack) {
      audioTrack.track.enabled = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (!peerConnection.current) return;
    const videoTrack = peerConnection.current.getSenders().find((s) => s.track.kind === "video");
    if (videoTrack) {
      videoTrack.track.enabled = !isVideoOff;
      setIsVideoOff(!isVideoOff);
    }
  };

  const generateRoomId = async () => {
    try {
      const response = await axios.post("https://jarvis-compiler.onrender.com/api/create-room/");
      setRoomId(response.data.room_id);
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  const handleJoinRoom = async () => {
    if (roomId.trim().length >= 5) {
      try {
        await axios.post("https://jarvis-compiler.onrender.com/api/join-room/", { room_id: roomId });
        setInRoom(true);
      } catch (error) {
        console.error("Error joining room:", error);
      }
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center p-4 ${darkMode ? "dark bg-gray-900 text-white" : "bg-gray-100"}`}>
      {inRoom ? (
        <div className="relative w-full max-w-4xl h-[70vh] bg-black rounded-lg overflow-hidden">
          {/* Remote Video (Full Screen) */}
          <video ref={remoteVideoRef} className="w-full h-full object-cover" autoPlay playsInline />
          <p className="absolute bottom-2 left-2 text-white bg-black bg-opacity-50 p-1 rounded">Remote</p>

          {/* Local Video (Small Overlay) */}
          <div className="absolute bottom-4 right-4 w-32 h-32 bg-gray-800 rounded-lg overflow-hidden border-2 border-white shadow-lg">
            <video ref={localVideoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
            <p className="absolute bottom-1 left-1 text-white bg-black bg-opacity-50 p-1 rounded text-xs">You</p>
          </div>

          {/* 🎯 FIXED BUTTONS BELOW VIDEO */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 z-10">
            <button onClick={toggleMute} className="p-3 bg-gray-800 text-white rounded-full hover:bg-gray-700">
              {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
            </button>
            <button onClick={toggleVideo} className="p-3 bg-gray-800 text-white rounded-full hover:bg-gray-700">
              {isVideoOff ? <FaVideoSlash /> : <FaVideo />}
            </button>
            <button onClick={() => setShowChat(!showChat)} className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-500">
              <FaComments />
            </button>
            <button onClick={() => setDarkMode(!darkMode)} className="p-3 bg-gray-800 text-white rounded-full hover:bg-gray-700">
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Join a Video Call</h1>
          <button onClick={generateRoomId} className="bg-blue-600 text-white px-6 py-2 rounded-lg">Create Room</button>
          <input type="text" value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder="Enter Room ID" className="p-2 border rounded-md mt-4" />
          <button onClick={handleJoinRoom} className="bg-green-600 text-white px-6 py-2 rounded-lg mt-2">Join Room</button>
        </div>
      )}
    </div>
  );
};

export default VideoCall;

import React, { useState, useEffect, useRef } from "react";
import "./ActualChatRoom.css";

const ActualChatRoom = ({ roomId, username }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const chatSocketRef = useRef(null); // Store WebSocket instance

  useEffect(() => {
    if (!roomId) {
      console.error("Error: Room ID is undefined");
      return;
    }

    chatSocketRef.current = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${roomId}/`);

    chatSocketRef.current.onopen = () => {
      console.log("WebSocket connected.");
    };

    chatSocketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prevMessages) => [
        ...prevMessages,
        { username: data.username, text: data.text, timestamp: data.timestamp || new Date().toLocaleTimeString() },
      ]);
      
      // Auto-scroll chat box
      const chatBox = document.getElementById("chat-box");
      if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
    };

    chatSocketRef.current.onclose = (event) => {
      console.log("WebSocket closed:", event);
    };

    chatSocketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      if (chatSocketRef.current) {
        chatSocketRef.current.close();
      }
    };
  }, [roomId]);

  const sendMessage = () => {
    if (username && message.trim() !== "" && chatSocketRef.current.readyState === WebSocket.OPEN) {
      chatSocketRef.current.send(JSON.stringify({ username, text: message }));
      setMessage("");
    } else {
      console.error("WebSocket is not open or message is empty");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Chat Room</h1>
        <h2 id="groupName">Group Name: {roomId}</h2>
        <strong id="titleUsername">UserName:{username}</strong>

        <div id="chat-box">
          {messages.map((msg, index) => (
            <div 
              key={index}
              className={msg.username === username ? "message-user" : "message-other"}
            >
              <small id="Username">@{msg.username}:</small><br />
              <strong id="Text">{msg.text}</strong>
              <small id="Time"> {msg.timestamp}</small>
            </div>
          ))}
        </div>

        <input
          type="text"
          id="message"
          className="input"
          value={message}
          placeholder="Type a message"
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ActualChatRoom;

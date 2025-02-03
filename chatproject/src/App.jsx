import { useState } from "react";
import "./App.css";
import ActualChatRoom from "./ActualChatRoom.jsx";

const ChatRoom = () => {
    const [showCreate, setShowCreate] = useState(false);
    const [showJoin, setShowJoin] = useState(false);
    const [responseMessage, setResponseMessage] = useState("");
    const [roomId, setRoomID] = useState("");
    const [username, setUsername] = useState("");
    const [chatActive, setChatActive] = useState(false); // Track if user is in chat

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "username") {
            setUsername(value);
        } else if (name === "roomNumber") {
            setRoomID(value);
        }
    };

    const creatingRoom = (e) => {
        e.preventDefault();
        fetch("https://7a89-2409-40d2-10bb-ae65-3c4e-863-144f-b49c.ngrok-free.app/create-room/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username }),
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.status === "success") {
                setRoomID(data.roomid);
                setChatActive(true); // Start chat
            } else {
                setResponseMessage("Failed to create room.");
            }
        })
        .catch((error) => setResponseMessage(`Error: ${error.message}`));
    };

    const joiningRoom = (e) => {
        e.preventDefault();
        fetch("https://7a89-2409-40d2-10bb-ae65-3c4e-863-144f-b49c.ngrok-free.app/join-room/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, roomid: roomId }),
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.status === "success") {
                setChatActive(true); // Start chat
            } else {
                setResponseMessage("Failed to join room. Check Room ID.");
            }
        })
        .catch((error) => setResponseMessage(`Error: ${error.message}`));
    };

    return (
        <div className="container">
            {chatActive ? (
                <ActualChatRoom roomId={roomId} username={username} />
            ) : (
                <div className="card">
                    <h2 className="title">Chat Room</h2>

                    <div className="button-group">
                        <button className="button button-create" onClick={() => { setShowCreate(true); setShowJoin(false); }}>
                            Create New Room
                        </button>
                        <button className="button button-join" onClick={() => { setShowJoin(true); setShowCreate(false); }}>
                            Join Room
                        </button>
                    </div>

                    {showCreate && (
                        <div className="form-section">
                            <h3 className="form-title">Create a Room</h3>
                            <form onSubmit={creatingRoom}>
                                <input type="text" name="username" value={username} placeholder="Enter your username" className="input" onChange={handleChange} />
                                <button type="submit" className="button-submit">Create</button>
                            </form>
                        </div>
                    )}

                    {showJoin && (
                        <div className="form-section">
                            <h3 className="form-title">Join a Room</h3>
                            <form onSubmit={joiningRoom}>
                                <input type="text" name="username" value={username} placeholder="Enter your username" className="input" onChange={handleChange} />
                                <input type="text" name="roomNumber" value={roomId} placeholder="Enter Room ID" className="input" onChange={handleChange} />
                                <button type="submit" className="button-submit button-submit-join">Join</button>
                            </form>
                        </div>
                    )}

                    {responseMessage && <p className="error-message">{responseMessage}</p>}
                </div>
            )}
        </div>
    );
};

export default ChatRoom;

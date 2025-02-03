import { useState } from "react";
import './ChatRoom.css'; // Import the CSS file

const ChatRoom = () => {
    const [showCreate, setShowCreate] = useState(false);
    const [showJoin, setShowJoin] = useState(false);

    return (
        <div className="container">
            <div className="card">
                <h2 className="title">Chat Room</h2>
                
                <div className="button-group">
                    <button 
                        className="button button-create" 
                        onClick={() => { setShowCreate(true); setShowJoin(false); }}
                    >
                        Create New Room
                    </button>
                    <button 
                        className="button button-join" 
                        onClick={() => { setShowJoin(true); setShowCreate(false); }}
                    >
                        Join Room
                    </button>
                </div>

                {showCreate && (
                    <div className="form-section">
                        <h3 className="form-title">Create a Room</h3>
                        <form action="/create_room/" method="post">
                            <input 
                                type="text" 
                                name="username" 
                                placeholder="Enter your username" 
                                className="input"
                            />
                            <button type="submit" className="button-submit">
                                Create
                            </button>
                        </form>
                    </div>
                )}

                {showJoin && (
                    <div className="form-section">
                        <h3 className="form-title">Join a Room</h3>
                        <form action="/chat/" method="post">
                            <input 
                                type="text" 
                                name="username" 
                                placeholder="Enter your username" 
                                className="input"
                            />
                            <input 
                                type="text" 
                                name="roomNumber" 
                                placeholder="Enter Room ID" 
                                className="input"
                            />
                            <button type="submit" className="button-submit button-submit-join">
                                Join
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatRoom;

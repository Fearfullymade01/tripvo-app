import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

// Placeholder for WebSocket connection
const BACKEND_URL =
    process.env.REACT_APP_BACKEND_URL ||
    "https://tripvo-backend-99eabd966d03.herokuapp.com";
const WS_URL = `${BACKEND_URL.replace("https://", "wss://")}/ws/chat/`;

function Chat({ planId, user }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [typing, setTyping] = useState(false);
    const [othersTyping, setOthersTyping] = useState([]);
    const ws = useRef(null);

    useEffect(() => {
        ws.current = new window.WebSocket(`${WS_URL}${planId}/`);
        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "message") {
                setMessages((prev) => [...prev, data.message]);
            } else if (data.type === "typing") {
                setOthersTyping(data.users);
            }
        };
        return () => ws.current.close();
    }, [planId]);

    const sendMessage = () => {
        if (input.trim()) {
            ws.current.send(
                JSON.stringify({
                    type: "message",
                    content: input,
                    user: user,
                }),
            );
            setInput("");
            setTyping(false);
        }
    };

    const handleInput = (e) => {
        setInput(e.target.value);
        if (!typing) {
            setTyping(true);
            ws.current.send(JSON.stringify({ type: "typing", user: user }));
        }
    };

    // Image upload handler
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                ws.current.send(
                    JSON.stringify({
                        type: "image",
                        user: user,
                        content: reader.result,
                        filename: file.name,
                    }),
                );
            };
            reader.readAsDataURL(file);
        }
    };

    // Reaction handler
    const sendReaction = (msgIdx, reaction) => {
        ws.current.send(
            JSON.stringify({
                type: "reaction",
                user: user,
                msgIdx,
                reaction,
            }),
        );
    };

    // Push notification simulation
    useEffect(() => {
        if (messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            if (
                lastMsg.user !== user &&
                Notification.permission === "granted"
            ) {
                new Notification(`New message from ${lastMsg.user}`, {
                    body: lastMsg.content,
                });
            }
        }
    }, [messages, user]);

    useEffect(() => {
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }
    }, []);

    return (
        <div className="chat-container">
            <div className="chat-messages">
                {messages.map((msg, idx) => (
                    <div key={idx} className="chat-message">
                        <span>{msg.user}: </span>
                        {msg.content && <span>{msg.content}</span>}
                        {msg.filename && (
                            <img
                                src={msg.content}
                                alt={msg.filename}
                                style={{ maxWidth: 200 }}
                            />
                        )}
                        <div className="chat-reactions">
                            <button onClick={() => sendReaction(idx, "👍")}>
                                👍
                            </button>
                            <button onClick={() => sendReaction(idx, "❤️")}>
                                ❤️
                            </button>
                            <button onClick={() => sendReaction(idx, "😂")}>
                                😂
                            </button>
                        </div>
                        {msg.reactions && (
                            <div className="reaction-list">
                                {Object.entries(msg.reactions).map(
                                    ([user, reaction]) => (
                                        <span key={user}>
                                            {user}: {reaction}{" "}
                                        </span>
                                    ),
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="chat-typing">
                {othersTyping.length > 0 && (
                    <span>{othersTyping.join(", ")} typing...</span>
                )}
            </div>
            <input
                type="text"
                value={input}
                onChange={handleInput}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
            />
            <button onClick={sendMessage}>Send</button>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
        </div>
    );
}

Chat.propTypes = {
    planId: PropTypes.string.isRequired,
    user: PropTypes.string.isRequired,
};

export default Chat;

import React, { useEffect, useState, useContext } from "react";
import { getMessages } from "../api/messaging";
import { useWebSocket } from "../hooks/useWebSocket";
import MessageInput from "./MessageInput";
import { AuthContext } from "../context/AuthContext";

const ChatWindow = ({ conversationId, token, otherUser }) => {
  const { messages, sendMessage, connectionStatus } = useWebSocket(
    conversationId,
    token
  );
  const [history, setHistory] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (conversationId) {
      getMessages(conversationId, token).then(setHistory);
    }
  }, [conversationId, token]);

  const allMessages = [...history, ...messages];

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "#28a745";
      case "reconnecting":
        return "#ffc107";
      case "error":
      case "failed":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Connected";
      case "reconnecting":
        return "Reconnecting...";
      case "error":
        return "Connection Error";
      case "failed":
        return "Connection Failed";
      default:
        return "Disconnected";
    }
  };

  return (
    <div
      className="chat-window"
      style={{ flex: 1, display: "flex", flexDirection: "column" }}
    >
      <div
        style={{
          margin: "0 0 1rem 0",
          padding: "1rem",
          borderBottom: "1px solid #ccc",
        }}
      >
        <h3 style={{ margin: "0 0 0.5rem 0" }}>
          Chat with {otherUser?.full_name || otherUser?.email || "User"}
        </h3>
        <div
          style={{ display: "flex", alignItems: "center", fontSize: "0.8rem" }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: getStatusColor(),
              marginRight: "6px",
            }}
          />
          <span style={{ color: getStatusColor() }}>{getStatusText()}</span>
        </div>
      </div>
      <div
        className="messages"
        style={{ flex: 1, overflowY: "auto", padding: "1rem" }}
      >
        {allMessages.map((m, idx) => {
          // Determine ownership: optimistic messages use sender === 'me'
          const isMe = m.sender === "me" || (user && m.sender === user.id);
          const text = m.message ?? m.text ?? "";
          return (
            <div
              key={idx}
              style={{ textAlign: isMe ? "right" : "left", margin: "0.5rem 0" }}
            >
              <p
                style={{
                  display: "inline-block",
                  padding: "0.5rem 1rem",
                  borderRadius: "12px",
                  background: isMe ? "#007bff" : "#eee",
                  color: isMe ? "#fff" : "#000",
                }}
              >
                {text}
              </p>
              <br />
              <small>{m.timestamp}</small>
            </div>
          );
        })}
      </div>
      <MessageInput onSend={sendMessage} />
    </div>
  );
};

export default ChatWindow;

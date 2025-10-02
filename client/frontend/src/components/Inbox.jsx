import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { getConversations } from "../api/messaging";
import { AuthContext } from "../context/AuthContext";

const Inbox = ({ token, onSelectConversation }) => {
  const [conversations, setConversations] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (token) {
      getConversations(token).then(setConversations);
    }
  }, [token]);

  // Listen for real-time message events from WebSocket
  useEffect(() => {
    const handleNewMessage = (event) => {
      const message = event.detail;

      setConversations((prev) => {
        const updated = prev.map((conversation) => {
          if (conversation.id === message.conversationId) {
            // Update this conversation with the new message
            return {
              ...conversation,
              last_message: {
                text: message.text,
                timestamp: message.timestamp,
                sender: message.sender,
              },
              // Mark as unread if message is from someone else
              hasUnread: message.sender !== user?.id,
            };
          }
          return conversation;
        });

        // Sort conversations by most recent message
        return updated.sort((a, b) => {
          const aTime = a.last_message?.timestamp || a.created_at;
          const bTime = b.last_message?.timestamp || b.created_at;
          return new Date(bTime) - new Date(aTime);
        });
      });
    };

    window.addEventListener("newMessage", handleNewMessage);
    return () => window.removeEventListener("newMessage", handleNewMessage);
  }, [user?.id]);

  const navigate = useNavigate();

  return (
    <div
      className="inbox"
      style={{ width: "30%", borderRight: "1px solid #ccc", padding: "1rem" }}
    >
      <h2>Inbox</h2>
      {conversations.map((c) => {
        const otherUser = c.participants?.find((p) => p.id !== user?.id);
        const handleClick = () => {
          // Clear unread status when conversation is clicked
          setConversations((prev) =>
            prev.map((conversation) =>
              conversation.id === c.id
                ? { ...conversation, hasUnread: false }
                : conversation
            )
          );

          // update URL so ChatWindow and routing reflect the selected conversation
          navigate(`/messages/${c.id}`);
          if (onSelectConversation) onSelectConversation(c.id, otherUser);
        };

        return (
          <div
            key={c.id}
            style={{
              padding: "0.5rem",
              cursor: "pointer",
              backgroundColor: c.hasUnread ? "#f0f8ff" : "transparent",
              borderLeft: c.hasUnread
                ? "4px solid #007bff"
                : "4px solid transparent",
              borderRadius: "4px",
              marginBottom: "4px",
            }}
            onClick={handleClick}
          >
            <p style={{ margin: "0 0 4px 0" }}>
              <strong style={{ color: c.hasUnread ? "#007bff" : "inherit" }}>
                {otherUser?.full_name || otherUser?.email}
                {c.hasUnread && (
                  <span style={{ color: "#007bff", marginLeft: "8px" }}>●</span>
                )}
              </strong>
            </p>
            <small
              style={{
                color: c.hasUnread ? "#333" : "#666",
                fontWeight: c.hasUnread ? "500" : "normal",
              }}
            >
              {c.last_message?.text ||
                c.messages?.slice(-1)[0]?.text ||
                "No messages yet"}
            </small>
          </div>
        );
      })}
    </div>
  );
};

export default Inbox;

import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  getConversationsWithUnread,
  markConversationRead,
} from "../api/messaging";
import { AuthContext } from "../context/AuthContext";

const Inbox = ({
  token,
  onSelectConversation,
  conversations,
  setConversations,
}) => {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (token && (!conversations || conversations.length === 0)) {
      getConversationsWithUnread(token).then(setConversations);
    }
  }, [token, conversations, setConversations]);

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
              // Mark as unread and increment count if message is from someone else
              hasUnread: message.sender !== user?.id,
              unread_count:
                message.sender !== user?.id
                  ? (conversation.unread_count || 0) + 1
                  : conversation.unread_count || 0,
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
          // Mark conversation as read when clicked
          if (c.unread_count > 0) {
            markConversationRead(c.id, token).catch(console.error);
          }

          // Clear unread status locally
          setConversations((prev) =>
            prev.map((conversation) =>
              conversation.id === c.id
                ? { ...conversation, unread_count: 0, hasUnread: false }
                : conversation
            )
          );

          // Dispatch event to update unread count
          window.dispatchEvent(new CustomEvent("messageRead"));

          // update URL so ChatWindow and routing reflect the selected conversation
          navigate(`/messages/${c.id}`);
          if (onSelectConversation) onSelectConversation(c.id, otherUser);
        };

        return (
          <div
            key={c.id}
            className={`inbox-conversation ${
              c.unread_count > 0 || c.hasUnread ? "unread" : ""
            }`}
            onClick={handleClick}
          >
            <div
              className={`inbox-user-name ${
                c.unread_count > 0 || c.hasUnread ? "unread" : ""
              }`}
            >
              <span>{otherUser?.full_name || otherUser?.email}</span>
              {c.unread_count > 0 ? (
                <span className="inbox-unread-badge">{c.unread_count}</span>
              ) : (
                c.hasUnread && <span className="inbox-unread-dot"></span>
              )}
            </div>
            <small className="inbox-last-message">
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

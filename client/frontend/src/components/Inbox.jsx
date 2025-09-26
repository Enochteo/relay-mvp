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

  const navigate = useNavigate();

  return (
    <div className="inbox" style={{ width: "30%", borderRight: "1px solid #ccc", padding: "1rem" }}>
      <h2>Inbox</h2>
      {conversations.map((c) => {
        const otherUser = c.participants?.find((p) => p.id !== user?.id);
        const handleClick = () => {
          // update URL so ChatWindow and routing reflect the selected conversation
          navigate(`/messages/${c.id}`);
          if (onSelectConversation) onSelectConversation(c.id, otherUser);
        };

        return (
          <div
            key={c.id}
            style={{ padding: "0.5rem", cursor: "pointer" }}
            onClick={handleClick}
          >
            <p>
              <strong>{otherUser?.full_name || otherUser?.email}</strong>
            </p>
            <small>{c.last_message?.text || c.messages?.slice(-1)[0]?.text || "No messages yet"}</small>
          </div>
        );
      })}
    </div>
  );
};

export default Inbox;

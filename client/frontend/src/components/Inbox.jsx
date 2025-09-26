import React, { useEffect, useState, useContext } from "react";
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

  return (
    <div className="inbox" style={{ width: "30%", borderRight: "1px solid #ccc", padding: "1rem" }}>
      <h2>Inbox</h2>
      {conversations.map((c) => {
        const otherUser = c.participants?.find((p) => p.id !== user?.id);
        return (
          <div
            key={c.id}
            style={{ padding: "0.5rem", cursor: "pointer" }}
            onClick={() => onSelectConversation(c.id, otherUser)}
          >
            <p>
              <strong>{otherUser?.full_name || otherUser?.email}</strong>
            </p>
            <small>{c.messages?.slice(-1)[0]?.text || "No messages yet"}</small>
          </div>
        );
      })}
    </div>
  );
};

export default Inbox;

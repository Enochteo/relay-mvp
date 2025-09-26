import React, { useState, useContext } from "react";
import { useParams } from "react-router-dom";
import Inbox from "../components/Inbox";
import ChatWindow from "../components/ChatWindow";
import { AuthContext } from "../context/AuthContext";

const MessagesPage = () => {
  const { conversationId } = useParams();
  const { accessToken } = useContext(AuthContext);
  const [activeConversation, setActiveConversation] = useState(conversationId || null);
  const [activeUser, setActiveUser] = useState(null);

  const handleSelectConversation = (id, otherUser) => {
    setActiveConversation(id);
    setActiveUser(otherUser);
  };

  return (
    <div className="messages-page" style={{ display: "flex", height: "80vh" }}>
      <Inbox token={accessToken} onSelectConversation={handleSelectConversation} />
      {activeConversation ? (
        <ChatWindow
          conversationId={activeConversation}
          token={accessToken}
          otherUser={activeUser}
        />
      ) : (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p>Select a conversation to start chatting</p>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;

import React, { useState, useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import Inbox from "../components/Inbox";
import ChatWindow from "../components/ChatWindow";
import { AuthContext } from "../context/AuthContext";
import { getConversations } from "../api/messaging";

const MessagesPage = () => {
  const { conversationId } = useParams();
  const { accessToken, user } = useContext(AuthContext);
  const [activeConversation, setActiveConversation] = useState(null);
  const [activeUser, setActiveUser] = useState(null);
  const [conversations, setConversations] = useState([]);

  // Load conversations when component mounts
  useEffect(() => {
    if (accessToken) {
      getConversations(accessToken).then(setConversations);
    }
  }, [accessToken]);

  // Handle URL-based navigation and find the other user
  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conversationIdInt = parseInt(conversationId, 10);
      setActiveConversation(conversationIdInt);

      // Find the conversation and extract the other user
      const conversation = conversations.find(
        (c) => c.id === conversationIdInt
      );
      if (conversation) {
        const otherUser = conversation.participants?.find(
          (p) => p.id !== user?.id
        );
        setActiveUser(otherUser || null);
      } else {
        // Conversation not found in current list - might be new or need refresh
        setActiveUser(null);
      }
    } else if (!conversationId) {
      setActiveConversation(null);
      setActiveUser(null);
    } else if (conversationId && conversations.length === 0) {
      // Set the conversation ID but wait for conversations to load for user info
      const conversationIdInt = parseInt(conversationId, 10);
      setActiveConversation(conversationIdInt);
    }
  }, [conversationId, conversations, user?.id]);

  const handleSelectConversation = (id, otherUser) => {
    const conversationIdInt = parseInt(id, 10);
    setActiveConversation(conversationIdInt);
    setActiveUser(otherUser);
  };

  return (
    <div className="messages-page" style={{ display: "flex", height: "80vh" }}>
      <Inbox
        token={accessToken}
        onSelectConversation={handleSelectConversation}
        conversations={conversations}
        setConversations={setConversations}
      />
      {activeConversation ? (
        <ChatWindow
          conversationId={activeConversation}
          token={accessToken}
          otherUser={activeUser}
        />
      ) : (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p>Select a conversation to start chatting</p>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;

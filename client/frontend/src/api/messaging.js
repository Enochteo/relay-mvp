import axios from "axios";

const API_URL = "http://localhost:8000/api/messaging";

export const getConversations = async (token) => {
  const res = await axios.get(`${API_URL}/conversations/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getMessages = async (conversationId, token) => {
  const res = await axios.get(
    `${API_URL}/conversations/${conversationId}/messages/`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

export const createConversation = async (sellerId, token) => {
  const res = await axios.post(
    `${API_URL}/conversations/`,
    { participants: [sellerId] },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

export const getUnreadCount = async (token) => {
  const res = await axios.get(`${API_URL}/unread-count/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.unread_count;
};

export const markConversationRead = async (conversationId, token) => {
  const res = await axios.post(
    `${API_URL}/conversations/${conversationId}/mark-read/`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

export const getConversationsWithUnread = async (token) => {
  const res = await axios.get(`${API_URL}/conversations/with-unread/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

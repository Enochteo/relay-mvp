import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getUnreadCount } from "../api/messaging";

export const useUnreadMessages = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { accessToken, user } = useContext(AuthContext);

  const fetchUnreadCount = async () => {
    if (!accessToken) {
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      const count = await getUnreadCount(accessToken);
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and periodic refresh
  useEffect(() => {
    fetchUnreadCount();
    if (!accessToken) return;
    const interval = setInterval(fetchUnreadCount, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, [accessToken]);

  // Listen for real-time message events
  useEffect(() => {
    const handleNewMessage = (event) => {
      // Always fetch from backend for accuracy
      fetchUnreadCount();
    };

    const handleMessageRead = () => {
      // Refresh unread count when messages are marked as read
      fetchUnreadCount();
    };

    // Listen for custom events
    window.addEventListener("newMessage", handleNewMessage);
    window.addEventListener("messageRead", handleMessageRead);

    return () => {
      window.removeEventListener("newMessage", handleNewMessage);
      window.removeEventListener("messageRead", handleMessageRead);
    };
  }, [user?.id]);

  return {
    unreadCount,
    loading,
    refreshUnreadCount: fetchUnreadCount,
    decrementUnreadCount: () => setUnreadCount((prev) => Math.max(0, prev - 1)),
  };
};

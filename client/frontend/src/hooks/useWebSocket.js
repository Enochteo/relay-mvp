import { useEffect, useRef, useState } from "react";

export const useWebSocket = (conversationId, token) => {
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!conversationId || !token) return;

    // Reset messages when switching conversations
    setMessages([]);

    const ws = new WebSocket(
      `ws://127.0.0.1:8000/ws/chat/${conversationId}/?token=${token}`
    );
    socketRef.current = ws;

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);

      // ✅ Only accept if it's for this conversation
      if (data.conversation_id !== conversationId) return;

      setMessages((prev) => {
        const optimisticIndex = prev.findIndex(
          (m) => m.optimistic && m.message === data.message
        );
        if (optimisticIndex !== -1) {
          const next = [...prev];
          next[optimisticIndex] = data; // replace with confirmed
          return next;
        }
        return [...prev, data];
      });
    };

    ws.onclose = () => console.log("WebSocket closed");

    return () => ws.close();
  }, [conversationId, token]);

  const sendMessage = (text) => {
    const optimistic = {
      sender: "me",
      message: text,
      timestamp: new Date().toISOString(),
      optimistic: true,
    };
    setMessages((prev) => [...prev, optimistic]);

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ message: text }));
    } else {
      console.warn("WebSocket not open; message queued locally (optimistic)");
    }
  };

  return { messages, sendMessage };
};

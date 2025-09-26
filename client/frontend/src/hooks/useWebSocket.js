import { useEffect, useRef, useState } from "react";

export const useWebSocket = (conversationId, token) => {
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!conversationId || !token) return;

    const ws = new WebSocket(
      `ws://localhost:8000/ws/chat/${conversationId}/?token=${token}`
    );
    socketRef.current = ws;

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setMessages((prev) => [...prev, data]);
    };

    ws.onclose = () => console.log("WebSocket closed");

    return () => ws.close();
  }, [conversationId, token]);

  const sendMessage = (text) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ message: text }));
    }
  };

  return { messages, sendMessage };
};

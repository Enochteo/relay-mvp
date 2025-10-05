import { useEffect, useRef, useState, useCallback } from "react";

export const useWebSocket = (conversationId, token) => {
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);

  const connect = useCallback(() => {
    if (!conversationId || !token) return;

    try {
      const ws = new WebSocket(
        `ws://127.0.0.1:8000/ws/chat/${conversationId}/?token=${token}`
      );
      socketRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        setConnectionStatus("connected");
        reconnectAttemptsRef.current = 0; // Reset reconnect attempts
      };

      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);

        // Only accept if it's for this conversation
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

        // Broadcast message event to other components (like Inbox)
        window.dispatchEvent(
          new CustomEvent("newMessage", {
            detail: {
              ...data,
              conversationId: data.conversation_id,
              text: data.message,
              timestamp: data.timestamp,
            },
          })
        );
      };

      ws.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason);
        setConnectionStatus("disconnected");

        // Reconnect with exponential backoff (max 30 seconds)
        const maxAttempts = 5;
        if (reconnectAttemptsRef.current < maxAttempts) {
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttemptsRef.current),
            30000
          );
          console.log(
            `Reconnecting in ${delay}ms (attempt ${
              reconnectAttemptsRef.current + 1
            }/${maxAttempts})`
          );

          setConnectionStatus("reconnecting");
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current += 1;
            connect();
          }, delay);
        } else {
          console.error("Max reconnection attempts reached");
          setConnectionStatus("failed");
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionStatus("error");
      };
    } catch (error) {
      console.error("Failed to create WebSocket:", error);
      setConnectionStatus("error");
    }
  }, [conversationId, token]);

  useEffect(() => {
    // Reset messages when switching conversations
    setMessages([]);

    // Clear any existing reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    // Close existing connection
    if (socketRef.current) {
      socketRef.current.close();
    }

    // Start new connection
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect]);

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
      // Attempt to reconnect if not already trying
      if (
        connectionStatus !== "reconnecting" &&
        connectionStatus !== "connected"
      ) {
        connect();
      }
    }
  };

  return { messages, sendMessage, connectionStatus };
};

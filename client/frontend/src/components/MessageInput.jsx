import React, { useState } from "react";

const MessageInput = ({ onSend }) => {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (text.trim()) {
      onSend(text);
      setText("");
    }
  };

  return (
    <div style={{ display: "flex", borderTop: "1px solid #ccc", padding: "0.5rem" }}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message..."
        style={{ flex: 1, padding: "0.5rem" }}
      />
      <button onClick={handleSend} style={{ marginLeft: "0.5rem" }}>
        Send
      </button>
    </div>
  );
};

export default MessageInput;

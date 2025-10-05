import React from "react";
import { useNavigate } from "react-router-dom";
import { createConversation } from "../api/messaging";

const ContactSellerBtn = ({ sellerId, token, user }) => {
  const navigate = useNavigate();

  const handleContact = async (sellerId) => {
    if (!token) {
      navigate("/login");
      return;
    }

    // Prevent users from contacting themselves
    if (user && user.id === sellerId) {
      alert("You cannot contact yourself!");
      return;
    }

    try {
      const convo = await createConversation(sellerId, token);
      navigate(`/messages/${convo.id}`);
    } catch (err) {
      console.error("Failed to start conversation", err);
    }
  };

  return (
    <button className="btn" onClick={() => handleContact(sellerId)}>
      Contact Seller
    </button>
  );
};

export default ContactSellerBtn;

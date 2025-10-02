import React from "react";
import { useNavigate } from "react-router-dom";
import { createConversation } from "../api/messaging";

const ContactSellerBtn = ({ sellerId, token }) => {
  const navigate = useNavigate();

  const handleClick = async () => {
    const convo = await createConversation(sellerId, token);
    navigate(`/messages/${convo.id}`);
  };

  return <button onClick={handleClick}>Contact Seller</button>;
};

export default ContactSellerBtn;

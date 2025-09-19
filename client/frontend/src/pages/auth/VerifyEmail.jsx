import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function VerifyEmail() {
  const { token } = useParams();
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios
      .get(`http://localhost:8000/api/users/verify-email/${token}/`)
      .then((res) => setMessage(res.data.detail || "Verified successfully!"))
      .catch(() => setMessage("Invalid or expired link"));
  }, [token]);

  return (
    <div>
      <h2>Email Verification</h2>
      <p>{message}</p>
    </div>
  );
}
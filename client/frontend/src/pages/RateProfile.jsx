import { useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

function RateProfile() {
  const { id } = useParams(); // useParams will give `id` from /profile/:id/rate
  const { accessToken } = useContext(AuthContext);
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(
        `/users/profile/${id}/rate/`,
        { score, comment },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      alert("Rating submitted!");
      navigate(`/profile/${id}`);
    } catch (err) {
      console.error("Failed to rate", err);
      alert("Error submitting rating");
    }
  };

  return (
    <div className="app-shell container-center">
      <form onSubmit={handleSubmit} className="card" style={{ width: 500 }}>
        <h3>Rate this seller</h3>
        <select
          value={score}
          onChange={(e) => setScore(Number(e.target.value))}
          style={{ marginBottom: 12 }}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n} ⭐
            </option>
          ))}
        </select>
        <textarea
          placeholder="Leave a comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{ marginBottom: 12 }}
        />
        <button className="btn">Submit</button>
      </form>
    </div>
  );
}

export default RateProfile;

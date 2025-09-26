import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

function Profile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get(`/users/profile/${id}/`)
      .then((res) => setProfile(res.data))
      .catch((err) => console.error("Failed to load profile", err));
  }, [id]);

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="app-shell">
      <div className="card" style={{ maxWidth: 600, margin: "0 auto" }}>
        <h2>{profile.user_full_name || profile.user_email}</h2>
        {profile.graduation_year && (
          <p>Class of {profile.graduation_year}</p>
        )}
        {profile.major && <p>{profile.major}</p>}
        {profile.bio && <p>{profile.bio}</p>}
        <p>
          ⭐ {profile.rating_avg?.toFixed(1)} ({profile.rating_count} reviews)
        </p>

        <button
          className="btn"
          onClick={() => navigate(`/profile/${id}/rate`)}
        >
          Leave a Review
        </button>
      </div>
    </div>
  );
}

export default Profile;

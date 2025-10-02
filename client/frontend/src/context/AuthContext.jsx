import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("access") || null
  );
  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem("refresh") || null
  );

  // Save tokens in localStorage
  useEffect(() => {
    if (accessToken) localStorage.setItem("access", accessToken);
    else localStorage.removeItem("access");

    if (refreshToken) localStorage.setItem("refresh", refreshToken);
    else localStorage.removeItem("refresh");
  }, [accessToken, refreshToken]);

  // Refresh access token every ~4 minutes (before expiry)
  useEffect(() => {
    if (!refreshToken) return;

    const interval = setInterval(async () => {
      try {
        const res = await axios.post(
          "http://localhost:8000/api/token/refresh/",
          {
            refresh: refreshToken,
          }
        );
        setAccessToken(res.data.access);
      } catch (err) {
        console.error("Failed to refresh token", err);
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
      }
    }, 4 * 60 * 1000); // 4 minutes

    return () => clearInterval(interval);
  }, [refreshToken]);

  // Fetch user profile whenever access token changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (accessToken) {
        try {
          const res = await axios.get("http://localhost:8000/api/users/me/", {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          setUser(res.data);
        } catch (err) {
          console.error("Failed to fetch user profile", err);
          setUser(null);
        }
      }
    };
    fetchProfile();
  }, [accessToken]);

  const login = async (email, password) => {
    const res = await axios.post("http://localhost:8000/api/token/", {
      email,
      password,
    });
    setAccessToken(res.data.access);
    setRefreshToken(res.data.refresh);

    const profileRes = await axios.get("http://localhost:8000/api/users/me/", {
      headers: { Authorization: `Bearer ${res.data.access}` },
    });
    setUser(profileRes.data);
  };

  const logout = async () => {
    try {
      await axios.post(
        "http://localhost:8000/api/users/logout/", // <-- FIXED ENDPOINT
        { refresh: refreshToken },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
    } catch (err) {
      console.error("Logout failed", err);
    }
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, accessToken, refreshToken, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

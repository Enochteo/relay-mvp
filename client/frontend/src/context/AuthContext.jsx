import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem("access") || null);
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem("refresh") || null);

  // Save tokens in localStorage
  useEffect(() => {
    if (accessToken) localStorage.setItem("access", accessToken);
    else localStorage.removeItem("access");

    if (refreshToken) localStorage.setItem("refresh", refreshToken);
    else localStorage.removeItem("refresh");
  }, [accessToken, refreshToken]);
  const login = async (email, password) => {
    const res = await axios.post("http://localhost:8000/api/token/", {
      email,
      password,
    });
    setAccessToken(res.data.access);
    setRefreshToken(res.data.refresh);
  };

const logout = async () => {
  try {
    await axios.post("http://localhost:8000/api/logout/", {
      refresh: refreshToken,
    }, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
  } catch (err) {
    console.error("Logout failed", err);
  }

  setUser(null);
  setAccessToken(null);
  setRefreshToken(null);
};

  return (
    <AuthContext.Provider value={{ user, accessToken, refreshToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
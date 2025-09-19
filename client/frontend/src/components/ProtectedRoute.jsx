import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { accessToken } = useContext(AuthContext);
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
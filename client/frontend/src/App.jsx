import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/Dashboard";
import Browse from "./pages/Browse";
import PostItem from "./pages/PostItem";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ProtectedRoute from "./components/ProtectedRoute";



function App() {
    return (
        <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Browse />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify/:token" element={<VerifyEmail />} />
        <Route path="/dashboard" element={<ProtectedRoute> <Dashboard /></ProtectedRoute>} />
        <Route path="/post" element={<ProtectedRoute><PostItem /></ProtectedRoute>} />
      </Routes>
    </Router>
    )
}

export default App;
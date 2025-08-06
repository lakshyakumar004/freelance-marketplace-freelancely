// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ClientDashboard from "./pages/ClientDashboard";
import PrivateRoute from "./components/PrivateRoute";
import ChatPage from "./pages/ChatPage"; // ✅ import ChatPage

function App() {
  const user = JSON.parse(localStorage.getItem("user"));
  const isLoggedIn = !!user;

  return (
    <Routes>
      {/* Root Route */}
      <Route
        path="/"
        element={
          isLoggedIn ? (
            user.accountType === "Freelancer" ? (
              <Navigate to="/dashboard" />
            ) : (
              <Navigate to="/client-dashboard" />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute allowedFor="Freelancer">
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/client-dashboard"
        element={
          <PrivateRoute allowedFor="Client">
            <ClientDashboard />
          </PrivateRoute>
        }
      />

      {/* ✅ Chat Route - allowed for both Freelancer and Client */}
      <Route
        path="/chat"
        element={
          <PrivateRoute allowedFor={["Freelancer", "Client"]}>
            <ChatPage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;

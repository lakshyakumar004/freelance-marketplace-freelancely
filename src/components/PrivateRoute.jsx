// src/components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, allowedFor }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // Not logged in → go to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check allowed roles
  if (allowedFor) {
    const allowedArray = Array.isArray(allowedFor) ? allowedFor : [allowedFor];
    const isAllowed = allowedArray.includes(user.accountType);

    if (!isAllowed) {
      // Redirect to their dashboard safely
      const redirectTo =
        user.accountType === "Freelancer" ? "/dashboard" : "/client-dashboard";
      return <Navigate to={redirectTo} replace />;
    }
  }

  // User allowed → render children
  return children;
};

export default PrivateRoute;

import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, allowedFor }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  // If allowedFor is defined and doesn't include the user's role
  if (allowedFor) {
    const isAllowed = Array.isArray(allowedFor)
      ? allowedFor.includes(user.accountType)
      : user.accountType === allowedFor;

    if (!isAllowed) {
      // Redirect to correct dashboard
      return user.accountType === "Freelancer"
        ? <Navigate to="/dashboard" />
        : <Navigate to="/client-dashboard" />;
    }
  }

  return children;
};

export default PrivateRoute;

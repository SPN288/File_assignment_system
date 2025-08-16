import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ allow = [] }) {
  const { auth } = useAuth();
  if (!auth) return <Navigate to="/login" replace />;
  if (allow.length && !allow.includes(auth.user.role)) {
    // redirect to their dashboard if role mismatch
    return <Navigate to={`/${auth.user.role}/dashboard`} replace />;
  }
  return <Outlet />;
}

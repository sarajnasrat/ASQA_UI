// ProtectedRoute.tsx - Make sure this is correct
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  permission?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  permission,
}) => {
  const token = localStorage.getItem("accessToken");
  const { hasPermission,authReady } = useAuth();
  const location = useLocation();

  // no token → login
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (!authReady) {
    return <div>Loading...</div>; // or spinner
  }
  // permission required but user doesn't have it
  if (permission && !hasPermission(permission)) {
    console.log("Access denied for permission:", permission);
    // Navigate to current path + /unauthorized to trigger dialog
    console.log(permission &&!hasPermission(permission) );
    return <Navigate to="/unauthorized" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};
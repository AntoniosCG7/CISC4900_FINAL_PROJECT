// Desc: This component is used to protect routes that require authentication and/or profile creation
import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute({ profileRequired }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const profileCompleted = useSelector((state) => state.auth.profileCompleted);

  // Check if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if profile is required but not created
  if (profileRequired && !profileCompleted) {
    return <Navigate to="/create-profile" replace />;
  }

  // If all conditions met, render child routes
  return <Outlet />;
}

export default ProtectedRoute;

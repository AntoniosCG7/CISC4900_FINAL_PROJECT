// Desc: This component is used to protect routes that require authentication and/or profile creation
import React from "react";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import { loadUser } from "../slices/authSlice";

function ProtectedRoute({ component: Component, profileRequired }) {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const profileCompleted = useSelector((state) => state.auth.profileCompleted);
  const loggedOut = useSelector((state) => state.auth.loggedOut);

  useEffect(() => {
    if (!isAuthenticated && !loggedOut) {
      dispatch(loadUser());
    }
  }, [dispatch, isAuthenticated, loggedOut]);

  // Check if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if profile is required but not created
  if (profileRequired && !profileCompleted) {
    return <Navigate to="/create-profile" replace />;
  }

  // If all conditions met, render the passed component
  return <Component />;
}

export default ProtectedRoute;

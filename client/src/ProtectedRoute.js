// src/ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ authUser, children }) => {
  const location = useLocation();

  // This component is rendered after App.js's initial loadingAuth check is complete.
  // So, authUser here will be either the user object or null.
  if (!authUser) {
    console.log("ProtectedRoute: User not authenticated. Path was:", location.pathname, ". Redirecting to home ('/').");
    // Redirect to the home page (FlashForm) if the user is not authenticated.
    // We still pass the 'from' location in state, in case you want to implement
    // a redirect back to the intended page after login via some other mechanism later.
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children; // If authenticated, render the child components (e.g., FlashcardDisplay)
};

export default ProtectedRoute;
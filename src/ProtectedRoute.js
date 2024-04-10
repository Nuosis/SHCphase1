// ProtectedRoute.js for React Router v6
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children }) => {
    const { authState } = useAuth();
    const isAuthenticated = authState.userToken;
    let location = useLocation();

    if (!isAuthenticated) {
        // Redirect them to the /signup page, but save the current location they were
        // trying to go to when they were redirected. This allows us to send them
        // along to that page after they login, which is a nicer user experience
        // than dropping them off on the home page.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;

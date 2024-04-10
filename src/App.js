import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext'; // Import your AuthContext
import { WorkOrderProvider } from './WorkOrderContext'; // Import your AuthContext
import SignupPage from './SignupPage';
import CustomerPortal from './CustomerPortal'; // Your protected component
import ProtectedRoute from './ProtectedRoute'; // Your ProtectedRoute component

function App() {
  return (
    <AuthProvider> {/* Wrap your application in AuthProvider */}
      <WorkOrderProvider>
        <Router>
          <Routes> {/* Use `Routes` instead of `Switch` */}
            <Route path="/login" element={<SignupPage />} />
            <Route path="/customer-portal" element={<ProtectedRoute><CustomerPortal /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </WorkOrderProvider>
    </AuthProvider>
  );
}

export default App;
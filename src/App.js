import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext'; // Import your AuthContext
import { WorkOrderProvider } from './WorkOrderContext'; // Import your AuthContext
import { UserProvider } from './UserContext';
import SignupPage from './Modules/SignupPage';
import CustomerPortal from './CustomerPortal'; // Your protected component
import ProtectedRoute from './ProtectedRoute'; // Your ProtectedRoute component
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

//const stripePromise = loadStripe('pk_test_51HukyvL804ojXsbD9GxRMkVNO6ab5KhrxUpqbUN9wKLZsPVpvgIqrQPlxW8hZH2nXccMELTn93y69Yg1fQDj8lpT00FH2WGsD1');
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_TEST_KEY);
if (!stripePromise) {
  console.error('Failed to initialize Stripe with the provided key');
} else {
  console.log('Stripe initialized successfully');
}

function App() {
  return (
    <AuthProvider> {/* Wrap your application in AuthProvider */}
      <UserProvider>
        <WorkOrderProvider>
          <Router>
            <Routes> {/* Use `Routes` instead of `Switch` */}
              <Route path="/login" element={<SignupPage />} />
              <Route path="/customer-portal" element={
                <ProtectedRoute>
                  <Elements stripe={stripePromise}>
                    <CustomerPortal />
                  </Elements>
                </ProtectedRoute>
              } />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </Router>
        </WorkOrderProvider>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;
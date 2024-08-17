import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './Contexts/AuthContext'; // Import your AuthContext
import { WorkOrderProvider } from './Contexts/WorkOrderContext'; // Import your AuthContext
import { UserProvider } from './Contexts/UserContext';
import { OrgProvider } from './Contexts/OrgContext';
import { CleanerProvider } from './Contexts/CleanerContext'
import { CustomerProvider } from './Contexts/CustomerContext';
import SignupPage from './Portals/SignupPage';
import CleanerPortal from './Portals/CleanerPortal'; // Your protected component
import BusinessPortal from './Portals/BusinessPortal'; // Your protected component
import CustomerPortal from './Portals/CustomerPortal'; // Your protected component
import ProtectedRoute from './ProtectedRoute'; // Your ProtectedRoute component
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
// import { getStateValue } from './Contexts/contextFunctions/GetStateValue';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_TEST_KEY);
if (!stripePromise) {
  console.error('Failed to initialize Stripe with the provided key');
} else {
  console.log('Stripe initialized successfully');
}

function App() {
  return (
    <AuthProvider> {/* Wrap your application in AuthProvider */}
      <OrgProvider>
        <UserProvider>
          <WorkOrderProvider>
            <Router>
              <Routes> {/* Use `Routes` instead of `Switch` */}
                <Route path="/login" element={<SignupPage />} />
                <Route path="/customer-portal" element={
                  <ProtectedRoute>
                    <Elements stripe={stripePromise}>
                      <CleanerProvider>
                        <CustomerPortal />
                      </CleanerProvider>
                    </Elements>
                  </ProtectedRoute>
                } />
                <Route path="/cleaner-portal" element={
                  <ProtectedRoute>
                    <CustomerProvider>
                      <CleanerPortal />
                    </CustomerProvider>
                  </ProtectedRoute>
                } />
                <Route path="/provider-portal" element={
                  <ProtectedRoute>
                    <CustomerProvider>
                      <CleanerProvider>
                        <BusinessPortal />
                      </CleanerProvider>
                    </CustomerProvider>
                  </ProtectedRoute>
                } />
                <Route path="*" element={<Navigate to="/login" />} />
              </Routes>
            </Router>
          </WorkOrderProvider>
        </UserProvider>
      </OrgProvider>
    </AuthProvider>
  );
}

export default App;
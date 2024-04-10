import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext'; // Ensure this path is correct
import { useWorkOrder } from './WorkOrderContext';
import Popup from './UI Elements/Popup.js'
import { useNavigate } from 'react-router-dom';

function CustomerPortal() {
    const { workOrderData } = useWorkOrder();
    const navigate = useNavigate();
    const authState = useAuth();
    
    return (
        <div>
            <h1>Customer Portal</h1>
            {/* Portal content goes here */}
        </div>
    );
}

export default CustomerPortal;

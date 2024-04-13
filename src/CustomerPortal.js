import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext'; // Ensure this path is correct
import { useWorkOrder } from './WorkOrderContext';
import Popup from './UI Elements/Popup.js'
import { useNavigate } from 'react-router-dom';

function CustomerPortal() {
    const { workOrderData } = useWorkOrder();
    const navigate = useNavigate();
    const [showPopup, setShowPopup] = useState(false);
    const authState = useAuth();
    const [popupContent, setPopupContent] = useState('');

    const handleShowData = () => {
        const workOrderDataStringified = JSON.stringify(workOrderData, null, 2);
        const authStateStringified = authState.userToken

        const combinedData = `Context workOrderData: ${workOrderDataStringified} Auth state: ${authStateStringified}`;
        setPopupContent(combinedData);
        setShowPopup(true);
    };

    return (
        <div>
            <h1>Customer Portal</h1>
            <button onClick={handleShowData}>Show Work Order Data</button>
            {showPopup && (
                <Popup message={popupContent} onClose={() => setShowPopup(false)} />
            )}
        </div>
    );
}

export default CustomerPortal;

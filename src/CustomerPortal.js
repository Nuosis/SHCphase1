import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext'; // Ensure this path is correct
import { useWorkOrder } from './WorkOrderContext';
import { useNavigate } from 'react-router-dom';
import Popup from './UI Elements/Popup.js'
import Portrait from './UI Elements/Portrait';
import altUserImage from './images/c311444e-7884-4491-b760-c2e4c858d4ce.webp'

/**
 * 
 * The design features a clean and user-friendly layout with 
 * a main dashboard showing
 *      a welcome message, 
 *      summary cards for recent work orders, and 
 *      upcoming appointments. 
 * The interface includes tabs or menu options for different modules: 
 *      Work Orders, 
 *      Communication, 
 *      Complaints, and 
 *      Account Settings.
 * 
 * It has a three column design:
 *      Left >> User Column:    
 *          Image,
 *          Summary of Recent Activity
 *          Notices
 *          Account Settings (Info, Instructions, Pet Settings, Access)
 * 
 *      Right >> App Colum
 *          Workorders
 *          Communication
 *          Concerns/Request Support
 * 
 *      Middle Column >> Action Column
 *          Interface for active module
 */


function CustomerPortal() {
    const { workOrderData } = useWorkOrder();
    const navigate = useNavigate();
    const [showPopup, setShowPopup] = useState(false);
    const authState = useAuth();
    const [popupContent, setPopupContent] = useState('');

    const handleShowData = () => {
        const workOrderDataStringified = JSON.stringify(workOrderData, null, 2);
        const authStateStringified = JSON.stringify(authState, null, 2);

        const combinedData = `Context workOrderData: ${workOrderDataStringified} Auth state: ${authStateStringified}`;
        setPopupContent(combinedData);
        setShowPopup(true);
    };

    return (
        <div className="customerPortal">
            <div className="leftBackgroundShadowBox">
                <h1>App Portal</h1>
                    <Portrait imageUrl={altUserImage} />
                <button onClick={handleShowData}>Show Work Order Data</button>
                {showPopup && (
                    <Popup message={popupContent} onClose={() => setShowPopup(false)} />
                )}
            </div>
            <div className="middleBackgroundShadowBox">
                <h1>Action Pane</h1>
            </div>
            <div className="rightBackgroundShadowBox">
                <h1>Customer Portal</h1>
            </div>
            

        </div>
    );
}

export default CustomerPortal;

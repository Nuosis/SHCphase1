import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext'; // Ensure this path is correct
import { useWorkOrder } from './WorkOrderContext';
import { useUser } from './UserContext.js';
import { useNavigate, useLocation  } from 'react-router-dom';
import Popup from './UI Elements/Popup.js'
import Portrait from './UI Elements/Portrait';
import SimpleCard from './UI Elements/SimpleCard.js'
import HeaderCard from './UI Elements/HeaderCard.js';
import HeaderRow from './UI Elements/HeaderRow.js';
import AccessCard from './UI Elements/Access.js'
import GeneralInstructions from './Modules/GeneralInstructions.js';
import MyPets from './Pets/Pet.js';
import altUserImage from './images/c311444e-7884-4491-b760-c2e4c858d4ce.webp'
import { Info, Pets, Key, ChecklistRtl, RadioButtonChecked, Payment } from '@mui/icons-material';

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
    //STATE
    const { authState } = useAuth();
    const { workOrderData } = useWorkOrder();
    const { userData } = useUser();
    // const navigate = useNavigate();
    const [showPopup, setShowPopup] = useState(false);
    const [popupContent, setPopupContent] = useState('');
    const [activeComponent, setActiveComponent] = useState(null);

    // Dynamic component map
    const componentMap = {
        MyPets: MyPets,
        AccessCard: AccessCard,
        GeneralInstructions: GeneralInstructions,
    };
    //FUNCTIONS
    //HANDLERS
    const handleShowData = () => {
        const workOrderDataStringified = JSON.stringify(workOrderData, null, 2);
        // const authStateStringified = JSON.stringify(authState, null, 2);
        const userStateStringified = JSON.stringify(userData, null, 2);

        const combinedData = `Context workOrderData: ${workOrderDataStringified} UserData: ${userStateStringified}`;
        setPopupContent(combinedData);
        setShowPopup(true);
    };

    const handleComponentChange = (componentKey, props = {}) => {
        const Component = componentMap[componentKey];
        if (Component) {
            setActiveComponent(<Component {...props} />);
        }
    };

    const handleSubmitAccess = (instructions) => {
        console.log('Access Instructions:', instructions);
        // Process the access instructions here
    };

    const handleSubmitPets = (Pets) => {
        console.log('Pets:', Pets);
        // Process the access instructions here
    };

    const handleSubmitGenInstruct = (instructions) => {
        console.log('General Instructions:', instructions);
        // Process the access instructions here
    };

    //VARIABLES
    const activityRows = [
        <HeaderRow
            key="house-cleaning"
            text='House Cleaning'
        />,
        <HeaderRow
            key="20240422"
            icon={<RadioButtonChecked />}
            onClick={() => console.log('Activity Row 1 clicked')}
            text='2024-04-22'
        />,
        <HeaderRow
            key="20240412"
            icon={<RadioButtonChecked />}
            onClick={() => console.log('Activity Row 2 clicked')}
            text='2024-04-12'
        />,
        <HeaderRow
            key="20240331"
            icon={<RadioButtonChecked />}
            onClick={() => console.log('Activity Row 1 clicked')}
            text='2024-03-31'
        />,
        // ... additional rows as needed
    ]
    const accountRows = [
        <HeaderRow
            key="info"
            icon={<Info />}
            onClick={() => handleComponentChange('Info')} 
            text='Information'
        />,
        <HeaderRow
            key="billing"
            icon={<Payment />}
            onClick={() => console.log('Billings clicked')}
            text='Bill History'
        />,
        <HeaderRow
            key="instructions"
            icon={<ChecklistRtl />}
            onClick={() => handleComponentChange('GeneralInstructions', { onSubmit: handleSubmitGenInstruct })}
            text='General Instructions'
        />,
        <HeaderRow
            key="pets"
            icon={<Pets />}
            onClick={() => handleComponentChange('MyPets', { onSubmit: handleSubmitPets })}
            text='My Pets'
        />,
        <HeaderRow
        key = "access"
        icon = {<Key />}
        onClick ={ () => handleComponentChange('AccessCard', { onSubmit: handleSubmitAccess })}
        text= 'Access'
        />
    ]

    return (
        <div className="customerPortal">
            <div className="leftBackgroundShadowBox">
                <Portrait imageUrl={altUserImage} />
                <SimpleCard text = {`Welcome ${userData.firstName}`} textStyle={{ textAlign: 'center', fontWeight: 'bold' , fontSize: '24px' }}/>
                <HeaderCard headerText = "Activity">
                    {activityRows}
                </HeaderCard>
                <HeaderCard headerText = "Account">
                    {accountRows}
                </HeaderCard>
                <button onClick={handleShowData}>Show Work Order Data</button>
                {showPopup && (
                    <Popup message={popupContent} onClose={() => setShowPopup(false)} />
                )}
            </div>
            <div className="middleBackgroundShadowBox">
                {activeComponent}
            </div>
            <div className="rightBackgroundShadowBox">
                <h1>Customer Portal</h1>
            </div>
            

        </div>
    );
}

export default CustomerPortal;

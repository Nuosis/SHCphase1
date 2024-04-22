import React, { useState, /*useEffect*/ } from 'react';
import { /*useAuth*/ } from './AuthContext'; // Ensure this path is correct
import { useWorkOrder } from './WorkOrderContext';
import { useUser } from './UserContext.js';
import { /*useNavigate, useLocation*/  } from 'react-router-dom';
import Popup from './UI Elements/Popup.js'
import Portrait from './UI Elements/Portrait';
import SimpleCard from './UI Elements/SimpleCard.js'
import HeaderCard from './UI Elements/HeaderCard.js';
import HeaderRow from './UI Elements/HeaderRow.js';
import HeaderSubrow from './UI Elements/HeaderSubrow.js';
import AccessCard from './Modules/Access.js'
import GeneralInstructions from './Modules/GeneralInstructions.js';
import InformationCard from './Modules/Information.js';
import MyPets from './Pets/Pet.js';
import altUserImage from './images/c311444e-7884-4491-b760-c2e4c858d4ce.webp'
import { Info, Pets, Key, ChecklistRtl, RadioButtonChecked, Payment } from '@mui/icons-material';


function CustomerPortal() {
    //STATE
    // const { authState, setAuthState } = useAuth();
    const { workOrderData } = useWorkOrder();
    const { userData, /*setUserData*/ } = useUser();
    console.log({userData},{workOrderData})
    // const navigate = useNavigate();
    const [showPopup, setShowPopup] = useState(false);
    const [popupContent, setPopupContent] = useState('');
    const [activeComponent, setActiveComponent] = useState(null);

    // Dynamic component map
    const componentMap = {
        MyPets: MyPets,
        AccessCard: AccessCard,
        GeneralInstructions: GeneralInstructions,
        InformationCard: InformationCard,
    };
    //FUNCTIONS
    function prepareActivityData(workOrderData, userData) {
        const activities = {};
    
        // Include workOrderData as the first entry if it exists, converting the date to ISO format
        if (workOrderData && workOrderData.activity && workOrderData.cleaningDate) {
            activities[workOrderData.activity] = [{
                date: new Date(workOrderData.cleaningDate).toISOString().slice(0, 10),
                isSelected: true
            }];
        }
    
        // Include billableData, ensuring not to overwrite the workOrderData entry
        if (userData && userData.billableData) {
            Object.entries(userData.billableData).forEach(([key, records]) => {
                records.forEach(record => {
                    if (!activities[key]) {
                        activities[key] = [];
                    }
                    activities[key].push({
                        date: new Date(record.invoiceDate).toISOString().slice(0, 10),
                        isSelected: (workOrderData && workOrderData.activity === key && new Date(workOrderData.cleaningDate).toISOString().slice(0, 10) === new Date(record.invoiceDate).toISOString().slice(0, 10))
                    });
                });
            });
        }
    
        return activities;
    }
    

    function generateActivityRows(activities) {
        const activityRows = Object.entries(activities).map(([activity, details]) => (
            <HeaderRow key={activity} text={activity} textStyle={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start'  }}>
                {details.map(detail => (
                    <HeaderSubrow
                        key={detail.date}
                        text={new Date(detail.date).toISOString().slice(0, 10)}
                        isSelected={detail.isSelected}
                    />
                ))}
            </HeaderRow>
        ));
    
        return activityRows;
    }
    
    
    
    
    
    //HANDLERS
    const handleShowData = () => {
        const workOrderDataStringified = JSON.stringify(workOrderData, null, 2);
        // const authStateStringified = JSON.stringify(authState, null, 2);
        const userStateStringified = JSON.stringify(userData, null, 2);

        const combinedData = `Context workOrderData: ${workOrderDataStringified} userData: ${userStateStringified}`;
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

    const handleSubmitGenInstruct = (instructions) => {
        console.log('General Instructions:', instructions);
        // Process the access instructions here
    };

    const handleSubmitInfo = (json) => {
        console.log('userInfo:', json);
        // Process the access instructions here
    };

    const handleSubmitPets = (Pets) => {
        console.log('Pets:', Pets);
        // Process the access instructions here
    };

    //VARIABLES
    // Prepare activity data
    const activities = prepareActivityData(workOrderData, userData);
    console.log({activities})

    // Generate activity rows from prepared data
    const activityRows = generateActivityRows(activities);
    
    const accountRows = [
        <HeaderRow
            key="info"
            icon={<Info />}
            onClick={() => handleComponentChange('InformationCard', { json: userData.userData, onSubmit: handleSubmitInfo })} 
            text='Information'
        />,
        <HeaderRow
            key="billing"
            icon={<Payment />}
            onClick={() => console.log('Billings clicked')}
            text='Bills & Payments'
        />,
    ]

    const settingRows = [
        <HeaderRow
            key="instructions"
            icon={<ChecklistRtl />}
            onClick={() => handleComponentChange('GeneralInstructions', { json: userData.userData.userDetails.generalInstructions, onSubmit: handleSubmitGenInstruct })}
            text='General Instructions'
        />,
        <HeaderRow
            key="pets"
            icon={<Pets />}
            onClick={() => handleComponentChange('MyPets', { json: userData.userData.userDetails.pet, onSubmit: handleSubmitPets })}
            text='My Pets'
        />,
        <HeaderRow
            key = "access"
            icon = {<Key />}
            onClick ={ () => handleComponentChange('AccessCard', { json: userData.userData.userDetails.accessInstructions, onSubmit: handleSubmitAccess })}
            text= 'Access'
        />
    ]

    return (
        <div className="customerPortal">
            <div className="leftBackgroundShadowBox">
                <Portrait imageUrl={altUserImage} />
                <SimpleCard text = {`Welcome ${userData.userData.userInfo.firstName}`} textStyle={{ textAlign: 'center', fontWeight: 'bold' , fontSize: '24px' }}/>
                <HeaderCard headerText = "Activity">
                    {activityRows}
                </HeaderCard>
                <HeaderCard headerText = "Account">
                    {accountRows}
                </HeaderCard>
            </div>
            <div className="middleBackgroundShadowBox">
                {activeComponent}
            </div>
            <div className="rightBackgroundShadowBox">
                <HeaderCard headerText = "Settings">
                    {settingRows}
                </HeaderCard>
                <HeaderCard headerText = "Comunication">
                    
                </HeaderCard>
            </div>
            

        </div>
    );
}

export default CustomerPortal;

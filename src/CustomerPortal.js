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
import AccessCard from './Modules/Access.js'
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
 * 
 * "UserData":{
        "userInfo":{
            "displayName":"Marcus Swift",
            "firstName":"Marcus",
            "lastName":"Swift",
            "dapiRecordID":"51",
            "ID":"6F46ABC0-B5AF-4CAE-9ACA-ECCE7401A88A"
        },
        "userDetails":{
            "partyType":[
                {
                    "data":"customer",
                    "ID":"EC190FFA-4F2C-4ED4-8A56-2A5093691D51",
                    "dapiRecordID":"1"
                }
            ],
            "pet":[
                {
                    "data":"{\"name\":\"Madi\",\"specialInstructions\":\"\",\"temporment\":[\"Friendly\",\"Affectionate\",\"Will dance for attention\"],\"type\":\"dog\"}",
                    "ID":"BEB55170-69A9-41ED-9BAB-57754F9244A1",
                    "dapiRecordID":""
                },
                {
                    "data":"{\"name\":\"Sunny\",\"specialInstructions\":\"\",\"temporment\":[\"Friendly\",\"Affectionate\"],\"type\":\"cat\"}",
                    "ID":"E6278BB3-47BA-437A-A44E-88C1C2EDCC25",
                    "dapiRecordID":""
                }
            ],
            "accessInstructions":[
                {
                    "data":"{\"details\":\"Front door code is 1234. then press 'lock'. The door will lock automatically but you can lock it by pressing 'lock' when you leave. Please make sure back doors are locked.\"}",
                    "ID":"2D292ED9-A892-4D35-A8F9-6A3434386F22",
                    "dapiRecordID":""
                }
            ],
            "generalInstructions":[
                {
                    "data":"{\"details\":\"Generally our focus is the bathrooms and the floors. We stay on the kitchen so that is less important. Avoid bleach as we are on a septic system. I notice build up on the floors behind the toilet.\"}",
                    "ID":"EDF9A519-7317-4C94-8422-71904B878801",
                    "dapiRecordID":""
                }
            ]
        },
        "userAddress":{
            "home":[
                {
                    "ID":"4BD19675-4BB2-45C3-8A5E-D193CC953B04",
                    "dapiRecordID":"17",
                    "street":"663 Caleb Pike Rd",
                    "unit":"",
                    "city":"Victoria",
                    "province":"BC",
                    "postalCode":"",
                    "country":""
                }
            ]
        },
        "userEmail":{
            "main":[
                {
                    "email":"marcus@claritybusinesssolutions.ca",
                    "ID":"7F128ADD-1F46-4954-B6B0-3727AD160780",
                    "dapiRecordID":"31",
                    "primary":"1"
                }
            ]
        },
        "userMessages":{
            
        },
        "userPhones":{
            "main":[
                {
                    "phone":"+7786783674",
                    "primary":1,
                    "sms":1,
                    "ID":"91F46758-325E-43BD-AB13-8F6AC3AFD19C",
                    "dapiRecordID":"15"
                }
            ]
        },
        "userBillables":{
            
        },
        "userRelated":{
            
        }
    }
 */


function CustomerPortal() {
    //STATE
    // const { authState, setAuthState } = useAuth();
    const { workOrderData } = useWorkOrder();
    const { userData, /*setUserData*/ } = useUser();
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
            onClick={() => handleComponentChange('Info', { json: userData.userDetails.generalInstructions, onSubmit: handleSubmitInfo })} 
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
            onClick={() => handleComponentChange('GeneralInstructions', { json: userData.userDetails.generalInstructions, onSubmit: handleSubmitGenInstruct })}
            text='General Instructions'
        />,
        <HeaderRow
            key="pets"
            icon={<Pets />}
            onClick={() => handleComponentChange('MyPets', { json: userData.userDetails.pet, onSubmit: handleSubmitPets })}
            text='My Pets'
        />,
        <HeaderRow
        key = "access"
        icon = {<Key />}
        onClick ={ () => handleComponentChange('AccessCard', { json: userData.userDetails.accessInstructions, onSubmit: handleSubmitAccess })}
        text= 'Access'
        />
    ]

    return (
        <div className="customerPortal">
            <div className="leftBackgroundShadowBox">
                <Portrait imageUrl={altUserImage} />
                <SimpleCard text = {`Welcome ${userData.userInfo.firstName}`} textStyle={{ textAlign: 'center', fontWeight: 'bold' , fontSize: '24px' }}/>
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

import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useWorkOrder, prepareWorkOrderData } from './WorkOrderContext';
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
import WorkOrderCard from './Modules/Workorder.js';
import WorkOrderReport from './Modules/WorkorderReport.js';
import CreditCardForm from './Modules/CreditCardInput.js';
import MyPets from './Pets/Pet.js';
import altUserImage from './images/c311444e-7884-4491-b760-c2e4c858d4ce.webp'
import { Info, Pets, Key, ChecklistRtl, /*RadioButtonChecked,*/ Payment } from '@mui/icons-material';
import CreateSale from './Sales/CreateSale.js'


function CustomerPortal() {
  //STATE
  const { authState } = useAuth();
  const { workOrderData, newWorkOrderData, setWorkOrderData } = useWorkOrder();
  const { userData, /*setUserData*/ } = useUser();
  const [popup, setPopup] = useState({ show: false, message: '' });
  const [activeComponent, setActiveComponent] = useState('WorkOrderCard');
  console.log({userData},{workOrderData},{newWorkOrderData})

  // Dynamic component map
  const componentMap = {
      MyPets: MyPets,
      AccessCard: AccessCard,
      GeneralInstructions: GeneralInstructions,
      InformationCard: InformationCard,
      WorkOrderCard: WorkOrderCard,
      WorkOrderReport: WorkOrderReport,
      CreditCardForm: CreditCardForm,
  };

  //FUNCTIONS
  function prepareActivityData() {
      const activities = {};
  
      // Include workOrderData as the first entry if it exists, converting the date to ISO format
      if (newWorkOrderData && newWorkOrderData.activity && newWorkOrderData.cleaningDate) {
          activities[newWorkOrderData.activity] = [{
              date: new Date(newWorkOrderData.cleaningDate).toISOString().slice(0, 10),
              isSelected: (workOrderData && new Date(newWorkOrderData.cleaningDate).toISOString().slice(0, 10) === new Date(workOrderData.cleaningDate).toISOString().slice(0, 10))
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
    const sortedActivities = Object.entries(activities).map(([activity, details]) => {
      // Sort the details array by date from newest to oldest
      const sortedDetails = details.sort((a, b) => new Date(b.date) - new Date(a.date));
      return [activity, sortedDetails];
    });
  
    const activityRows = sortedActivities.map(([activity, details]) => (
      <HeaderRow key={activity} text={activity} textStyle={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        {details.map(detail => (
          <HeaderSubrow
            key={detail.date}
            text={new Date(detail.date).toISOString().slice(0, 10)}
            onClick={() => handleWorkOrderChange(detail.date)}
            isSelected={detail.isSelected}
          />
        ))}
      </HeaderRow>
    ));
  
    return activityRows;
  }

  const renderActiveComponent = () => {
    // console.log('Active component:', activeComponent);
    const Component = componentMap[activeComponent];
    if (!Component) return null;
    const token=authState.token

    // Define props here if they are dynamic based on the component
    const componentProps = {
        ...(activeComponent === 'WorkOrderCard' && { workOrderData, setWorkOrderData, onSubmitWorkOrder: handleSubmitWorkOrder }),
        ...(activeComponent === 'InformationCard' && { json: userData.userData, onSubmitInformation: handleSubmitInfo }),
        ...(activeComponent === 'GeneralInstructions' && { json: userData.userData.userDetails.generalInstructions, onSubmitGenInstruct: handleSubmitGenInstruct }),
        ...(activeComponent === 'AccessCard' && { json: userData.userData.userDetails.accessInstructions, onSubmitAccess: handleSubmitAccess }),
        ...(activeComponent === 'MyPets' && { json: userData.userData.userDetails.pet, onSubmit: handleSubmitPets }),
        ...(activeComponent === 'WorkOrderReport' && { workOrderData }),
        ...(activeComponent === 'CreditCardForm' && { token, userData, setActiveComponent, setWorkOrderData }),
        // Extend this pattern for other components as needed
    };

    return <Component {...componentProps} />;
  };
  
  //HANDLERS
  const handleWorkOrderChange = async (date) => {
    console.log('handleWorkOrderChange:', date);
    try {
      let woData = null;
      //SET WORKORDERDATA
      if (newWorkOrderData && newWorkOrderData.cleaningDate === date) {
        woData = newWorkOrderData;
      } else if (workOrderData && workOrderData.cleaningDate === date) {
        woData = workOrderData;
      } else {
        console.log('need to construct new workOrderObject')
        woData = await prepareWorkOrderData(authState.token, userData, date, "Home Cleaning");
      }

      //UPDATE STATE (OR NOT)
      if (woData){
        console.log('Resolved work order data:', {woData});
        setWorkOrderData(woData);
      } else {
        console.error('No work order data found for the selected date or error occured when prepairing the workOrderData.');
        setPopup({ show: true, message: "No work order data found for the selected date or error occured when prepairing the workOrderData." });
      }

      //RENDER COMPONENT
      if (!woData.invoiceNo) {
        setActiveComponent('WorkOrderCard');
      } else {
        setActiveComponent('WorkOrderReport');
      }
    } catch (error) {
      setWorkOrderData(workOrderData);
      console.error('Error preparing work order data:', error);
      setPopup({ show: true, message: error.message });
    }
  };

  const handleComponentChange = (componentKey, props = {}) => {
    if (componentMap[componentKey]) {
        setActiveComponent(componentKey);
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

  const handleSubmitWorkOrder = async(json) => {
      console.log('workOrder Submitted:', workOrderData);
      const saleData = await CreateSale(userData,workOrderData,authState.token);
      if (saleData === true) {
        console.log("Sale process submitted successfully.");
        // confirm CC or collect
        // payment intent
        // inform card will be charged at 7am on day of the clean
        // late cancel fee
        // process to inform cleaners
      } else {
        console.error("Sale process failed:", saleData);
        // revert handled in CreateSale
        // inform customer
        // attempt to submit order request via email
      }
  };

  const handleSubmitPets = (Pets) => {
      console.log('Pets:', Pets);
      // Process the access instructions here
  };

    //VARIABLES
    // Prepare activity data
    const activities = prepareActivityData(workOrderData, userData);
    // console.log({activities})

    // Generate activity rows from prepared data
    const activityRows = generateActivityRows(activities); 
    
    const accountRows = [
      <HeaderRow
        key="info"
        icon={<Info />}
        onClick={() => handleComponentChange('InformationCard')} 
        text='Information'
      />,
      <HeaderRow
        key="billing"
        icon={<Payment />}
        onClick={() => handleComponentChange('CreditCardForm')}
        text='Bills & Payments'
      />,
    ]

    const settingRows = [
        <HeaderRow
            key="instructions"
            icon={<ChecklistRtl />}
            onClick={() => handleComponentChange('GeneralInstructions')}
            text='General Instructions'
        />,
        <HeaderRow
            key="pets"
            icon={<Pets />}
            onClick={() => handleComponentChange('MyPets')}
            text='My Pets'
        />,
        <HeaderRow
            key = "access"
            icon = {<Key />}
            onClick ={ () => handleComponentChange('AccessCard')}
            text= 'Access'
        />
    ]

    return (
      <div className="customerPortal">
        {/* Overlay and POPUP */}
        {popup.show && (
          <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50" style={{ zIndex: 30 }}>
              <Popup message={popup.message} onClose={() => setPopup({ ...popup, show: false })} />
          </div>
        )}
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
          {renderActiveComponent()}
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

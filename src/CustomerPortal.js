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
import CreditCardDetails from './Modules/CreditCardDetails.js';
import MyPets from './Pets/Pet.js';
import altUserImage from './images/c311444e-7884-4491-b760-c2e4c858d4ce.webp'
import { Info, Pets, Key, ChecklistRtl, /*RadioButtonChecked,*/ Payment } from '@mui/icons-material';
import CreateSale from './Sales/CreateSale.js'
import { callStripeApi } from './Sales/stripe.js'
import { createRecord } from './FileMaker/createRecord.js';


function CustomerPortal() {
  //STATE
  const { authState } = useAuth();
  const { workOrderData, setWorkOrderData, newWorkOrderData, setNewWorkOrderData } = useWorkOrder();
  const { userData, getUserData, /*setUserData*/ } = useUser();
  const [popup, setPopup] = useState({ show: false, message: '' });
  const initialComponent = Object.keys(newWorkOrderData).length > 0 ? 'WorkOrderCard':'';
  const [activeComponent, setActiveComponent] = useState(initialComponent);
  const [activePanel, setActivePanel] = useState('app');
  console.log({userData},{workOrderData},{newWorkOrderData})

  useEffect(() => {
    if (activeComponent) {
      setActivePanel('mid');
    }
  }, [activeComponent]);

  // Dynamic component map
  const componentMap = {
      MyPets: MyPets,
      AccessCard: AccessCard,
      GeneralInstructions: GeneralInstructions,
      InformationCard: InformationCard,
      WorkOrderCard: WorkOrderCard,
      WorkOrderReport: WorkOrderReport,
      CreditCardForm: CreditCardForm,
      CreditCardDetails: CreditCardDetails
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
    //console.log('Active component:', activeComponent);
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
        ...(activeComponent === 'CreditCardForm' && { token, userData, onSubmit: handleSubmitWorkOrder }),
        ...(activeComponent === 'CreditCardDetails' && { token, userData, setActiveComponent, setWorkOrderData }),
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
    //console.log('componenetKey: ',componentKey)
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
      
      // confirm CC or collect
      const stripeData = JSON.parse(userData.userData.userDetails.stripeInfo[0].data)
      // console.log({stripeData})
      const hasCreditCard = await callStripeApi(authState.token, 'hasValidCard', {customerId: stripeData.id})
      // console.log('hasCreditCard: ',hasCreditCard)

      if (hasCreditCard) {
        const saleData = await CreateSale(userData,workOrderData,authState.token);
        if (saleData.success) {
          console.log("Sale process completed successfully.");
          // Customer created in Stripe and QBO and stored in UserData
          // Invoice created in FM and QBO
        } else {
          console.error("Sale process failed:", saleData);
          setPopup({ show: true, message: saleData });
          return
        }
        console.log("Sale process submitted successfully.");

        // reset newWorkOrderData to null
        setNewWorkOrderData({});

        // reset billable in userData
        await getUserData(userData.userData.userInfo.ID)

        handleComponentChange('WorkOrderReport')

        setPopup({ show: true, message: 'Clean booked! Your card will be charged 24 hrs before clean is scheduled to begin. Cancel anytime prior to payment processing. Within 24 hrs, reschedule with 50% credit.' });

        // PROCESS IN STRIPE
        /**
         * sale is now complete. if next part fails can reprocess on server
         * for each billable (for home cleaning) there should be a recordDetail witha payment intent, if not create 
         */
        try {
          let params = {
            amount: workOrderData.price*100 ,
            currency: 'CAD',
            customerId: stripeData.id
          }
          let paymentIntent = await callStripeApi(authState.token, 'createPaymentIntent', params)
          // prcess if returns error >> popup
          console.log({paymentIntent})
          if (!paymentIntent || !paymentIntent.clientSecret) {
            throw new Error(`Error processing payment intent`);
          }
          params = {
            fieldData: {
              '_fkID': saleData.billableID,
              data: `{"clientSecret":"${paymentIntent.clientSecret}"`,
              type: 'stripePaymentIntent'
            },
          }
          console.log({params})

          let response = await createRecord(authState.token, params, 'dapiRecordDetails', false)
          console.log({response})
          if(!response.messages || !response.messages[0] || response.messages[0].code !== "0") {
            throw new Error(`error recording paymentIntention: ${JSON.stringify(response)}`)
          }
          // TODO: process to inform/assign cleaners
        } catch(error) {
          console.error("Error processing payment: ", error.message);
        }
      } else {
        // render cc input form
        setPopup({ show: true, message: 'Payment method required' });
        handleComponentChange('CreditCardForm')
      }
  };

  const handleSubmitPets = (Pets) => {
      console.log('Pets:', Pets);
      // Process the access instructions here
  };

  const handleTabClick = (panel) => {
    setActivePanel(panel);
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
      onClick={() => handleComponentChange('CreditCardDetails')}
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

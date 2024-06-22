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
    <div className="bg-gray-100 font-sans leading-normal tracking-normal flex flex-col min-h-screen">
      <nav className="bg-white shadow-lg border-gray-200 dark:bg-gray-900 dark:border-gray-700 sticky top-0" style={{ borderBottom: "1px solid rgba(156,163,175,0.25)" }}>
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-2">
          <a href="https://selecthomecleaning.ca" className="flex items-center py-2 px-2 text-gray-700 hover:text-gray-900">
              <img src="https://selecthomecleaning.ca/wp-content/uploads/2022/09/SelectJanitorial_green_114.png" className="max-h-12" alt="Select Home Cleaning"/>
          </a>
          <button data-collapse-toggle="navbar-multi-level" type="button" className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-multi-level" aria-expanded="false">
              <span className="sr-only">Menu</span>
              <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15"/>
              </svg>
          </button>
          <div className="hidden w-full md:block md:w-auto" id="navbar-multi-level">
            <ul className="flex flex-col font-medium p-4 md:p-0 mx-6 my-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
              {
                //HISTORY
              }
              <li>
                <button id="previousOrdersLink" data-dropdown-toggle="previousOrder" className="flex items-center justify-between w-full py-2 px-3 text-gray-900 dark:text-gray-200 hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 md:w-auto  md:dark:hover:text-blue-500 dark:focus:text-white dark:hover:bg-gray-700 md:dark:hover:bg-transparent">
                    <i className="iconoir-multiple-pages text-3xl"></i>
                    <p className="pl-2">Previous Orders</p>
                    <svg className="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
                    </svg>
                </button>
                { 
                  //Dropdown menu
                }
                <div id="previousOrder" className="z-10 hidden font-normal bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600">
                  <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownLargeButton">
                      <li>
                          <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">4th Jun 2024</a>
                      </li>
                      <li>
                          <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">26th May 2024</a>
                      </li>
                      <li>
                          <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">12th May 2024</a>
                      </li>
                      <li>
                          <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">All Orders</a>
                      </li>
                  </ul>
                </div>
              </li>
              { 
                //ACCOUNT
              }
              <li>
                  <button id="accountLink" data-dropdown-toggle="accountNavbar" className="flex items-center justify-between w-full py-2 px-3 text-gray-900 dark:text-gray-200 hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 md:w-auto md:dark:hover:text-blue-500 dark:focus:text-white dark:hover:bg-gray-700 md:dark:hover:bg-transparent">
                      <img
                          src={altUserImage}
                          className="rounded-full"
                          style={{ height: "32px", width: "32px" }}
                          alt=""
                          loading="lazy" />
                      <p className="pl-2">{userData.userData.userInfo.firstName} {userData.userData.userInfo.lastName}</p>
                      <svg className="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
                      </svg>
                  </button>
                  {
                    //Dropdown menu
                  }
                  <div id="accountNavbar" className="z-10 hidden font-normal bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600">
                      <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="doubleDropdownButton">
                          <li>
                              <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Account Details</a>
                          </li>
                          <li>
                              <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">General Instructions</a>
                          </li>
                          <li>
                              <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Communication</a>
                          </li>
                      </ul>
                      <div className="py-1">
                          <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Sign out</a>
                      </div>
                  </div>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      {/* Overlay and POPUP */}
      {popup.show && (
        <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50" style={{ zIndex: 30 }}>
            <Popup message={popup.message} onClose={() => setPopup({ ...popup, show: false })} />
        </div>
      )}
      {/* BODY */}
      <div  class="flex-grow">
        {/* BANNER */}
        <div 
          className="h-[15vw] mb-8 flex items-top shadow-lg" 
          style={{ 
            background: "url(https://storage.googleapis.com/gen-atmedia/2/2015/04/52b8d4825906632e7b3252aad33f37de5e3a9581.jpeg)",
            backgroundSize: 'cover',
            backgroundPosition: '50% 55%'
          }}
        />
        {/* USER SPACE */}
        {renderActiveComponent()}
      </div>
      {/*
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
      */}
      <footer className="bg-white dark:bg-gray-900 dark:border-gray-700 shadow-lg mt-4 md:sticky md:bottom-0 md:left-0 md:right-0 flex items-center justify-center" style={{ borderTop: "1px solid rgba(156,163,175,0.25)" }}>
        <div className="p-8 md:py-8 md:px-0 max-w-screen-md w-full">
            <div className="flex justify-between">
                <div>
                    <p className="text-lg font-semibold dark:text-gray-200">Total Price: $157.50</p>
                    <p className="text-xs text-gray-400">Cleaning: $120.00, Provide Equipment: $30.00, GST: $7.50</p>
                </div>
                <div className="md:flex items-center space-x-1">
                    <button type="submit" className="w-full text-white p-2 px-8 rounded font-semibold bg-brand-green">Book Cleaning</button>
                </div>
            </div>
        </div>
      </footer>

    </div>
  );
}

export default CustomerPortal;

import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useWorkOrder, prepareWorkOrderData } from './WorkOrderContext';
import { useUser } from './UserContext.js';
import { /*useNavigate, useLocation*/  } from 'react-router-dom';
import Popup from './UI Elements/Popup.js'
import Footer from './UI Elements/Footer';
import AccessCard from './Modules/Access.js'
import GeneralInstructions from './Modules/GeneralInstructions.js';
import InformationCard from './Modules/Information.js';
import WorkOrderCard from './Modules/Workorder.js';
import WorkOrderReport from './Modules/WorkorderReport.js';
import CreditCardForm from './Modules/CreditCardInput.js';
import CreditCardDetails from './Modules/CreditCardDetails.js';
import MyPets from './Pets/Pet.js';
import CommunicationPortal from './Modules/Commiunication.js';
import altUserImage from './images/c311444e-7884-4491-b760-c2e4c858d4ce.webp'
// import { Info, Pets, Key, ChecklistRtl, /*RadioButtonChecked,*/ Payment } from '@mui/icons-material';
import CreateSale from './Sales/CreateSale.js'
import { callStripeApi } from './Sales/stripe.js'
import { createRecord } from './FileMaker/createRecord.js';
import { readRecord } from './FileMaker/readRecord.js'
import { updateRecord } from './FileMaker/updateRecord.js'
import { deleteRecord } from './FileMaker/deleteRecord.js'

function CustomerPortal() {
  //STATE
  const { authState } = useAuth();
  const { workOrderData, setWorkOrderData, newWorkOrderData, setNewWorkOrderData } = useWorkOrder();
  const { userData, getUserData, /*setUserData*/ } = useUser();
  const [popup, setPopup] = useState({ show: false, message: '' });
  const [edited, setEdited] = useState([])
  const [isPreviousOrdersOpen, setIsPreviousOrdersOpen] = useState(false);
  const [isAccountNavbarOpen, setIsAccountNavbarOpen] = useState(false);
  const [isMenubarOpen, setIsMenubarOpen] = useState(false);
  const initialComponent = Object.keys(newWorkOrderData).length > 0 ? 'WorkOrderCard':'';
  const [activeComponent, setActiveComponent] = useState(initialComponent);
  console.log({userData},{workOrderData},{newWorkOrderData})

  // push edits to fileMkaer
  useEffect(() => {
    /**
     * setEdited passes an object of {action, path}   
     * ACTIONS >> Delete, Update, Create
    */ 
    if (edited.length === 0) return;
    const edit = edited[0];
    console.log("Processing Edit:", edit); // Check the current edit
    const { action, path, value } = edit; // Assumes each edit is an object { action, path, value }
    console.log({action},{path},{value})
    const processEdit = async () => {
      try {
        const pathParts = path.split('.');
        const key = pathParts.pop(); // Gets the last element
        const metaDataPath = [...pathParts, "metaData"].join('.');
        const metaData = getValue(userData, metaDataPath);
        const table = metaData[key]?.table || metaData.table;
        let recordID = metaData[key]?.recordID || metaData.recordID;
        const UUID = metaData[key]?.ID || metaData.ID;
        console.log({key},{metaData},{table},{recordID},{UUID})
  
        if (!recordID && !UUID) {
          setPopup({ show: true, message: "There was an issue in the way the data is stored and retrieved. Update unsuccessfull" });
          return
        } else if (!recordID) {
          const params = [{"_partyID": UUID}];
          const layout = table;
          const data = await readRecord(authState.token, params, layout);
          if (data.length === 0) throw new Error("Error getting recordID from FileMaker");
          recordID = data.response.recordId;
        }
        const layout = table;
  
        if (action === 'update') {
          const keyValue = !value? getValue(userData, path):value
          const params = { fieldData: { [key]: keyValue } };
          const data = await updateRecord(authState.token, params, layout, recordID);
          if (data.messages && data.messages[0].code !== "0") {
            throw new Error(`Failed to update record: ${data.messages[0].message}`);
          }
          console.log("update successful")
        } else if (action === 'delete') {
          // CAUSING CRASHES
          const data = await deleteRecord(authState.token, layout, recordID);
          if (data.messages && data.messages[0].code !== "0") {
            throw new Error(`Failed to delete record: ${data.messages[0].message}`);
          }
        }
        // Remove the processed edit
        setEdited(prev => prev.slice(1));
      } catch (error) {
        console.error(`Error processing ${action}:`, error);
      }
    };
    processEdit();
  },[edited, userData, authState.token])

  // Dynamic component map
  const componentMap = {
      MyPets: MyPets,
      AccessCard: AccessCard,
      GeneralInstructions: GeneralInstructions,
      InformationCard: InformationCard,
      WorkOrderCard: WorkOrderCard,
      WorkOrderReport: WorkOrderReport,
      CreditCardForm: CreditCardForm,
      CreditCardDetails: CreditCardDetails,
      CommunicationPortal: CommunicationPortal
  };

  //FUNCTIONS
  const renderActiveComponent = () => {
    //console.log('Active component:', activeComponent);
    const Component = componentMap[activeComponent];
    if (!Component) return null;
    const token=authState.token

    // Define props here if they are dynamic based on the component
    const componentProps = {
        ...(activeComponent === 'WorkOrderCard' && { workOrderData, setWorkOrderData, onSubmitWorkOrder: handleSubmitWorkOrder, setEdited }),
        ...(activeComponent === 'InformationCard' && { onSubmitInformation: handleSubmitInfo, edited, setEdited }),
        ...(activeComponent === 'GeneralInstructions' && { json: userData.userData.userDetails.generalInstructions, onSubmitGenInstruct: handleSubmitGenInstruct }),
        ...(activeComponent === 'AccessCard' && { json: userData.userData.userDetails.accessInstructions, onSubmitAccess: handleSubmitAccess }),
        ...(activeComponent === 'MyPets' && { json: userData.userData.userDetails.pet, onSubmit: handleSubmitPets }),
        ...(activeComponent === 'WorkOrderReport' && { workOrderData, message }),
        ...(activeComponent === 'CreditCardForm' && { token, userData, onSubmit: handleSubmitWorkOrder }),
        ...(activeComponent === 'CreditCardDetails' && { token, userData, setActiveComponent, setWorkOrderData }),
        ...(activeComponent === 'CommunicationPortal' && { onSubmitMessage: handleSubmitMessage }),
        // Extend this pattern for other components as needed
    };

    return <Component {...componentProps} />;
  };

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
      const sortedDetails = details.sort((a, b) => new Date(b.date) - new Date(a.date));
      return [activity, sortedDetails];
    });

    const activityRows = sortedActivities.map(([activity, details]) => (
      details.map(detail => (
        <div
          key={detail.date}
          text={new Date(detail.date).toISOString().slice(0, 10)}
          onClick={() => handleWorkOrderChange(detail.date)}
          className={detail.isSelected ? 'selected-class' : ''}
        >
          <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">
            {new Date(detail.date).toISOString().slice(0, 10)}
          </a>
        </div>
      ))
    ));

    return activityRows;
  }

  const renderFooter = (data) => {
    // Default footer props to ensure footer renders even if no data or active component
    let footerProps = {
      totalPrice: () => '',
      priceBreakdown: () => [],
      buttonText: '',
      buttonClickHandler: () => {},
      icon: '',
    };
  
    // Get the component from the activeComponent state
    const Component = componentMap[activeComponent];
  
    // If there is no active component or no data, render the footer with default props
    if (!Component || !data) {
      // return <Footer {...footerProps} />;
    } 
  
    // Conditional logic based on the active component
    if (activeComponent === 'WorkOrderCard') {
      footerProps = {
        totalPrice: `Total Price: $${data.price.toFixed(2)}`,
        priceBreakdown: data.lineTotals,
        buttonText: 'Book Cleaning',
        buttonClickHandler: handleSubmitWorkOrder,
        icon: 'CheckCircle'
      };
    } else if (activeComponent === 'WorkOrderReport') {
      footerProps = {
        totalPrice: `Total Price: $${data.price.toFixed(2)}`,
        priceBreakdown: data.lineTotals,
        buttonText: 'Get Receipt',
        buttonClickHandler: handleGetReceipt,
        icon: 'FileDownload'
      };
    } 

    // else if (activeComponent === 'MyPets') {
    //   footerProps = {
    //     buttonText: 'New Pet',
    //     // This button handler doesnt work
    //     buttonClickHandler: MyPets.handleAddPet,
    //   };
    // }
  
    // Render the footer with the determined props
    return <Footer {...footerProps} />;
  }

  const message = (org) =>{

  }

  const getValue = (state, path) => {
    // console.log('Initial State:', state);
    try {
        const pathParts = path.match(/([^\.\[\]]+|\[\d+\])/g); // This regex matches property names and array indices
        return pathParts.reduce((acc, part) => {
            const match = part.match(/\[(\d+)\]/); // Check if the part is an array index
            if (match) {
                return acc ? acc[parseInt(match[1])] : undefined; // Access the array index
            }
            return acc ? acc[part] : undefined; // Access the property
        }, state);
    } catch (error) {
        console.error(`Error navigating state with key ${path}:`, error);
        return ''; // Return a default/fallback value
    }
  }
  
  //HANDLERS
  const handleWorkOrderChange = async (date) => {
    console.log('handleWorkOrderChange:', date);
    togglePreviousOrders()
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

  const handleComponentSelect = (componentKey, props = {}) => {
    //console.log('componenetKey: ',componentKey)
    toggleAccountNavbar()
    handleComponentChange(componentKey)
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

  const handleSubmitMessage = (message) => {
    console.log('Message:', message);
    // Process the message here
};

  const handleSubmitGenInstruct = (instructions) => {
      console.log('General Instructions:', instructions);
      // Process the access instructions here
  };

  const handleGetReceipt = (json) => {
      console.log('getReceipt:', json);
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
  
  // Handle the state of the open dropdown menues
  const togglePreviousOrders = () => {
    setIsPreviousOrdersOpen(!isPreviousOrdersOpen);
    setIsAccountNavbarOpen(false);
  };
  const toggleAccountNavbar = () => {
    setIsAccountNavbarOpen(!isAccountNavbarOpen);
    setIsPreviousOrdersOpen(false);
  };
  const toggleMenubar = () => setIsMenubarOpen(!isMenubarOpen);
  document.addEventListener('click', function (event) {
    if (event.target.closest('nav')){
      // Click on nav do nothing
    } else {
      // if we have and panels open close them
      if (isAccountNavbarOpen) setIsAccountNavbarOpen(false);
      if (isPreviousOrdersOpen) setIsPreviousOrdersOpen(false);
      if (isMenubarOpen) setIsMenubarOpen(false);
    }
  }, false);

  //VARIABLES
  // Prepare activity data
  const activities = prepareActivityData(workOrderData, userData);

  return (
    <div className="bg-gray-100 dark:bg-gray-800 font-sans leading-normal tracking-normal flex flex-col min-h-screen">
      <nav className="bg-white shadow-lg border-gray-200 dark:bg-gray-900 dark:border-gray-700 sticky top-0" style={{ borderBottom: "1px solid rgba(156,163,175,0.25)" }}>
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-2">
          <a href="https://selecthomecleaning.ca" className="flex items-center py-2 px-2 text-gray-700 hover:text-gray-900">
            <img src="select-home-cleaning.png" className="max-h-12" alt="Select Home Cleaning" />
          </a>
          <button
            data-collapse-toggle="navbar-multi-level"
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            aria-controls="navbar-multi-level"
            aria-expanded={isMenubarOpen}
            onClick={toggleMenubar}
          >
            <span className="sr-only">Menu</span>
            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
            </svg>
          </button>
          <div className={`w-full md:block md:w-auto  ${isMenubarOpen ? '' : 'hidden'}`} id="navbar-multi-level">
            <ul className="flex flex-col font-medium p-4 md:p-0 mx-6 my-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
              {/* HISTORY */}
              <li>
                <button
                  id="previousOrdersLink"
                  data-dropdown-toggle="previousOrder"
                  className="flex items-center justify-between w-full py-2 px-3 text-gray-900 dark:text-gray-200 hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-primary md:p-0 md:w-auto md:dark:hover:text-secondary dark:focus:text-white dark:hover:bg-gray-700 md:dark:hover:bg-transparent"
                  onClick={togglePreviousOrders}
                >
                  
                  <i className="iconoir-multiple-pages text-3xl"></i>
                  <p className="pl-2">Previous Orders</p>
                  <svg className="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                  </svg>
                </button>
                <div id="previousOrder" className={`z-10 ${isPreviousOrdersOpen ? '' : 'hidden'} absolute font-normal bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600`}>
                  <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownLargeButton">
                    {generateActivityRows(activities).flat()}
                  </ul>
                </div>
              </li>
              {/* ACCOUNT */}
              <li>
                <button
                  id="accountLink"
                  data-dropdown-toggle="accountNavbar"
                  className="flex items-center justify-between w-full py-2 px-3 text-gray-900 dark:text-gray-200 hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-primary md:p-0 md:w-auto md:dark:hover:text-secondary dark:focus:text-white dark:hover:bg-gray-700 md:dark:hover:bg-transparent"
                  onClick={toggleAccountNavbar}
                >
                  <img
                    src={altUserImage}
                    className="rounded-full"
                    style={{ height: "32px", width: "32px" }}
                    alt=""
                    loading="lazy"
                  />
                  <p className="pl-2">{userData.userData.userInfo.firstName} {userData.userData.userInfo.lastName}</p>
                  <svg className="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                  </svg>
                </button>
                <div id="accountNavbar" className={`z-10 ${isAccountNavbarOpen ? '' : 'hidden'} absolute font-normal bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600`}>
                  <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="doubleDropdownButton">
                    <li>
                      <button onClick={() => handleComponentSelect('InformationCard')} className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Account Details</button>
                    </li>
                    <li>
                      <button onClick={() => handleComponentSelect('CreditCardDetails')} className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Billing</button>
                    </li>
                    <li>
                      <button onClick={() => handleComponentSelect('GeneralInstructions')} className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">General Instructions</button>
                    </li>
                    <li>
                      <button onClick={() => handleComponentSelect('MyPets')} className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">My Pets</button>
                    </li>
                    <li>
                      <button onClick={() => handleComponentSelect('AccessCard')} className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Access Instructions</button>
                    </li>
                    <li>
                      <button onClick={() => handleComponentSelect('CommunicationPortal')} className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Communication</button>
                    </li>
                  </ul>
                  <div className="py-1">
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Sign out</button>
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
      <div className="flex-grow">
        {/* BANNER */}
        <div 
          className="h-[15vw] mb-8 flex items-top shadow-lg header-image"
          style={{ 
            
          }}
        />
        {/* USER SPACE */}
        {renderActiveComponent()}
      </div>
      {/* FOOTER */}
      <footer className="bg-white dark:bg-gray-900 dark:border-gray-700 shadow-lg mt-4 sticky bottom-0 left-0 right-0 flex items-center justify-center" style={{ borderTop: "1px solid rgba(156,163,175,0.25)" }}>
        {renderFooter(workOrderData)}
      </footer>
    </div>
  );
}

export default CustomerPortal;
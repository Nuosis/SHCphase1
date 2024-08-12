import React, { useState, useEffect } from 'react';
import { useAuth } from '../Contexts/AuthContext.js';
import { useWorkOrder, prepareWorkOrderData } from '../Contexts/WorkOrderContext.js';
import { useUser } from '../Contexts/UserContext.js';
import { useOrg } from '../Contexts/OrgContext.js';
import Popup from '../UI Elements/Popup.js'
import Footer from '../UI Elements/Footer.js';
import AccessCard from '../Modules/Access.js'
import GeneralInstructions from '../Modules/GeneralInstructions.js';
import InformationCard from '../Modules/Information.js';
import WorkOrderCard from '../Modules/Workorder.js';
import WorkOrderReport from '../Modules/WorkorderReport.js';
import CreditCardForm from '../Modules/CreditCardInput.js';
import CreditCardDetails from '../Modules/CreditCardDetails.js';
import MyPets from '../Pets/Pet.js';
import CommunicationPortal from '../Modules/Commiunication.js';
import altUserImage from '../images/c311444e-7884-4491-b760-c2e4c858d4ce.webp'
import CreateSale from '../Sales/CreateSale.js'
import { callStripeApi } from '../Sales/stripe.js'
import { createRecord } from '../FileMaker/createRecord.js';
import { HouseOutlined } from '@mui/icons-material';
import SHC from '../images/SelectHome-StackedLogo-Pine&Lime.png'
import { ProcessEdit } from '../Contexts/contextFunctions/ProcessEdit.js';

// If the imported icons are not directly referenced the package build complains
const icons = {
  HouseOutlined,  
};

function CustomerPortal() {
  //STATE
  const { authState } = useAuth();
  const { workOrderData, setWorkOrderData, newWorkOrderData, setNewWorkOrderData } = useWorkOrder();
  const { userData, getUserData, setUserData } = useUser();
  const { orgData } = useOrg();
  const [ popup, setPopup ] = useState({ show: false, message: '' });
  const [ edited, setEdited ] = useState([])
  const [ isPreviousOrdersOpen, setIsPreviousOrdersOpen ] = useState(false);
  const [ isAccountNavbarOpen, setIsAccountNavbarOpen ] = useState(false);
  const [ isMenubarOpen, setIsMenubarOpen ] = useState(false);
  const initialComponent = Object.keys(newWorkOrderData).length > 0 ? 'WorkOrderCard':'';
  const [ activeComponent, setActiveComponent ] = useState(initialComponent);
  console.log({userData},{orgData},{workOrderData},{newWorkOrderData})

  // push edits to fileMaker
  useEffect(() => {
    /**
     * setEdited passes an object of {action, path}   
     * ACTIONS >> Delete, Update, Create
     * PATH >> STATE.{{pathToValue}}
    */ 
    if (edited.length === 0) return;
    const edit = edited[0];
    console.log("Processing Edit:", edit); // Check the current edit
    const { action, path, value } = edit; // Assumes each edit is an object { action, path, value }
    ProcessEdit(action, path, value, authState, setEdited, setPopup);
  },[edited])

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
        ...(activeComponent === 'WorkOrderCard' && { workOrderData, setWorkOrderData, handleComponentSelect, setEdited }),
        ...(activeComponent === 'InformationCard' && { setEdited }),
        ...(activeComponent === 'GeneralInstructions' && { json: userData.Details.generalInstructions, onSubmitGenInstruct: setEdited }),
        ...(activeComponent === 'AccessCard' && { json: userData.Details.accessInstructions, onSubmitAccess:  setEdited }),
        ...(activeComponent === 'MyPets' && { json: userData.Details.pet, onSubmit: setEdited }),
        ...(activeComponent === 'WorkOrderReport' && { workOrderData, setMessage, edited, setEdited, userData, setUserData  }),
        ...(activeComponent === 'CreditCardForm' && { token, userData, onSubmit: handleSubmitWorkOrder }),
        ...(activeComponent === 'CreditCardDetails' && { token, userData, setActiveComponent, setWorkOrderData }),
        ...(activeComponent === 'CommunicationPortal' && { userData }),
        // Extend this pattern for other components as needed
    };

    return <Component {...componentProps} />;
  };

  function prepareActivityData() {
    const activities = {};

    // Include newWorkOrderData as the first entry if it exists, converting the date to ISO format
    if (newWorkOrderData && newWorkOrderData.activity && newWorkOrderData.cleaningDate) {
        activities[newWorkOrderData.activity] = [{
            date: new Date(newWorkOrderData.cleaningDate).toISOString().slice(0, 10),
            name: new Date(newWorkOrderData.cleaningDate).toISOString().slice(0, 10) + ' <span class="font-bold text-primary">(New)</span>',
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
                    name: new Date(record.invoiceDate).toISOString().slice(0, 10),
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
                onClick={() => handleWorkOrderChange(detail.date)}
                className={detail.isSelected ? 'selected-class' : ''}
                dangerouslySetInnerHTML={{ __html: `<a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">${detail.name}</a>` }}
            />
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
        // totalPrice: `Total Price: $${data.price.toFixed(2)}`,
        priceBreakdown: data.lineTotals,
        buttonText: 'Book Cleaning',
        buttonClickHandler: handleSubmitWorkOrder,
        icon: 'CheckCircle'
      };
    } else if (activeComponent === 'WorkOrderReport') {
      footerProps = {
        // totalPrice: `Total Price: $${data.price.toFixed(2)}`,
        priceBreakdown: data.lineTotals,
        buttonText: 'Get Receipt',
        buttonClickHandler: handleGetReceipt,
        icon: 'FileDownload'
      };
    } 
  
    // Render the footer with the determined props
    return <Footer {...footerProps} />;
  }

  const setMessage = (org) =>{

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

  const handleGetReceipt = (json) => {
      console.log('getReceipt:', json);
      // Process the access instructions here
  };

  const handleSubmitWorkOrder = async(json) => {
      console.log('workOrder Submitted:', workOrderData);
      
      // confirm CC or collect
      const stripeData = JSON.parse(userData.Details.stripeInfo[0].data)
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
        await getUserData(userData.Info.metaData.ID)

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

  const handleNewOrder = () => {
    // Check if new work order data exists
    if (newWorkOrderData) {
      // Set the active component to display the new work order
      if (!newWorkOrderData.invoiceNo) {
        setActiveComponent('WorkOrderCard');
        setWorkOrderData(newWorkOrderData); // Set the new work order data as the current work order
      } else {
        setActiveComponent('WorkOrderReport');
        setWorkOrderData(newWorkOrderData); // Set the new work order data as the current work order
      }
    } else {
      // Handle the case when there is no new work order data
      window.open('https://www.selecthomecleaning.ca', '_blank'); //open in new tab
    }
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
            <img src={SHC} className="max-h-12" alt="Select Home Cleaning" />
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
                  <p className="pl-2">{userData.Info.firstName} {userData.Info.lastName}</p>
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
              {/* WORK ORDERS */}
              <li>
                <button
                  id="previousOrdersLink"
                  data-dropdown-toggle="previousOrder"
                  className="flex items-center justify-between w-full py-2 px-3 text-gray-900 dark:text-gray-200 hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-primary md:p-0 md:w-auto md:dark:hover:text-secondary dark:focus:text-white dark:hover:bg-gray-700 md:dark:hover:bg-transparent"
                  onClick={togglePreviousOrders}
                >
                  
                  <i className="iconoir-multiple-pages text-3xl"></i>
                  <p className="pl-2">Work Orders</p>
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
                {/* NEW ORDER */}
                {newWorkOrderData && newWorkOrderData.activity && newWorkOrderData.cleaningDate ? (
                <button
                    id="newOrder"
                    className="flex items-center justify-between w-full py-2 px-3 text-gray-900 dark:text-gray-200 hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-primary md:p-0 md:w-auto md:dark:hover:text-secondary dark:focus:text-white dark:hover:bg-gray-700 md:dark:hover:bg-transparent"
                    onClick={handleNewOrder}
                  >
                  <i className="iconoir-cart-alt text-3xl"></i>
                  <p className="pl-2">View Order</p>
                </button>
                ) : (
                <button
                id="newOrder"
                className="flex items-center justify-between w-full py-2 px-3 text-gray-900 dark:text-gray-200 hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-primary md:p-0 md:w-auto md:dark:hover:text-secondary dark:focus:text-white dark:hover:bg-gray-700 md:dark:hover:bg-transparent"
                onClick={handleNewOrder}
                >
                <i className="iconoir-cart-plus text-3xl"></i>
                <p className="pl-2">New Order</p>
                </button>
              )}
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
      <div className="flex-grow flex-col flex">
        {/* BANNER */}
        <div 
          className="h-[15vw] mb-8 flex items-top shadow-lg header-image"
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
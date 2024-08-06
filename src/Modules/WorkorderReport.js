import React from 'react';
import CardContainer from '../UI Elements/CardContainer';
import CardInput from '../UI Elements/CardInput.js';
import { IconButton } from '../UI Elements/Button.js';

const submitRatingToGMB = async (rating) => {
  try {
    const response = await fetch('YOUR_GMB_API_ENDPOINT', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rating }),
    });
    const data = await response.json();
    console.log('Rating submitted to GMB:', data);
  } catch (error) {
    console.error('Error submitting rating to GMB:', error);
  }
};

const WorkOrderReport = ({ workOrderData, setMessage, edited, setEdited, userData, setUserData }) => {
  
  const handleReceiptRequest = () => {
    let url;
    return url;
  };

  const cardsData = [
    {
      id: "1",
      headerText: "Work Order",
      headerHiddenText: { Hours: `${workOrderData.lineTotals.length} hrs`, Date: workOrderData.cleaningDate },
      state: workOrderData,
      setState: null,
      persistOpen: false,
    },
    {
      id: "2",
      headerText: "Activity Report",
      headerHiddenText: { Activity: workOrderData.activity, Cleaner: workOrderData.cleaner },
      state: workOrderData,
      setState: null,
    },
    {
      id: "3",
      headerText: "Feedback",
      headerHiddenText: { Alert: "Tip your cleaner 15% on Us!" },
      state: userData,
      setState: setUserData,
      setEdited: setEdited,
      defaultOpen: true,
      flex: "col",
      children: (
        <>
          <CardInput 
            label="If you think we've earned it, we would love a 5 star review. We'll send a thank you to your cleaner of a 15% tip" 
            type="text" 
            id="rating" 
            childType="star"
            state={userData}
            setState={setUserData}
            stateKey={`${workOrderData.path}.rating`}
            setEdited={setEdited}
            onNew={true}
          />
          <CardInput
            label="Comment" 
            type="text" 
            id="ratingComment" 
            childType="textarea"
            state={userData}
            setState={setUserData}
            stateKey={`${workOrderData.path}.ratingDescription`}
            setEdited={setEdited}
            placeholder="Add comment..."
          />
          <div className="flex gap-4 py-8">
            <IconButton
              icon="Person"
              className="btn btn-outline dark:btn-outline dark:text-gray-500"
              onClick={() => setMessage("cleaner")}
              type="Button"
              text="Message Cleaner"
            />
            <IconButton
              icon="Business"
              className="btn btn-outline dark:btn-outline dark:text-gray-500"
              onClick={() => setMessage("company")}
              type="Button"
              text="Message Select"
            />
          </div>
        </>
      ),
    }
  ];

  return (
    <div className="flex-grow items-stretch justify-center flex-grow">
      <CardContainer cardsData={cardsData} />
    </div>
  );
};

export default WorkOrderReport;
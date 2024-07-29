import React, {/*useState*/} from 'react';
import Card from '../UI Elements/Card.js';
import CardInput from '../UI Elements/CardInput.js';
import { IconButton, /*TextButton, TextButtonSecondary*/ } from '../UI Elements/Button.js';

/**
 * 
 * Use this componenet when not displaying sale (displaying history) 
 * 
 */

// Function to submit rating to Google My Business
const submitRatingToGMB = async (rating) => {
  // Implement your logic to submit the rating to Google My Business
  // This may include API calls with necessary authentication
  try {
    const response = await fetch('YOUR_GMB_API_ENDPOINT', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add necessary headers for authentication
      },
      body: JSON.stringify({ rating }),
    });
    const data = await response.json();
    console.log('Rating submitted to GMB:', data);
  } catch (error) {
    console.error('Error submitting rating to GMB:', error);
  }
};

// TODO: (if Now > cleanDate), add special request
// TODO: cancel clean (if Now>24hrs before clean)
// TODO: reschedule clean (if Now is 24hrs prior to clean, 50% coupon)

const WorkOrderReport = ({ workOrderData, setMessage, edited, setEdited, userData, setUserData }) => {
  // console.log("WorkOrderCard rendering...");

  const handleReceiptRequest = () => {
    // TODO
    let url
    // set  url from api call to node server
    return url;
  };

  return (
    <div className="flex flex-col items-center justify-center flex-grow">
      <Card 
        headerText="Work Order"
        headerHiddenText={{ Hours: `${workOrderData.lineTotals.length} hrs`, Date: workOrderData.cleaningDate }}
        state={workOrderData}
        setState={null}
        id="1"
        persistOpen={false}
      />
      <Card 
        headerText="Activity Report"
        headerHiddenText={{ Activity: workOrderData.activity, Cleaner: workOrderData.cleaner }}
        state={workOrderData}
        setState={null}
        id="2"
      >
        {/**
         * // TODO
        <CardInput 
          label="Report" 
          type="pdf" 
          id="report.pdf" 
          childType="document"
          stateKey="lineTotals.length"
        />
        */}
      </Card>
      <Card 
        headerText="Feedback"
        headerHiddenText={{ Alert: "Tip your cleaner 15% on Us!" }}
        state={userData}
        setState={setUserData}
        setEdited={setEdited}
        defaultOpen={true}
        flex="col"
        id="3"
      >
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
            onClick={setMessage("cleaner")}
            type="Button"
            text="Message Cleaner"
          />
          <IconButton
            icon="Business"
            className="btn btn-outline dark:btn-outline dark:text-gray-500"
            onClick={setMessage("company")}
            type="Button"
            text="Message Select"
          />
        </div>
      </Card>
    </div>
  );
};

export default WorkOrderReport;

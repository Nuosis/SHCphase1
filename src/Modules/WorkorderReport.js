import React, {useState} from 'react';
// import { useUser } from '../UserContext.js';
import Card from '../UI Elements/Card.js';
import CardInput from '../UI Elements/CardInput.js';
//import Totals from '../UI Elements/Totals.js';
import { Accordion } from '../UI Elements/Accordion.js';
import { TextButton } from '../UI Elements/Button.js';
//import { IconButton } from '../UI Elements/Button';
// import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { v4 as uuidv4 } from 'uuid';

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
// TODO: cancel clean (if Now>24hrs befor clean)
// TODO: reschedule clean (if Now is 24hrs prior to clean, 50% cuppon)

const WorkOrderReport = ({ workOrderData, message }) => {
  // console.log("WorkOrderCard rendering...");
  const cleaningDate = workOrderData.cleaningDate
  const highTasks = workOrderData.tasks.highPriority.map(task => ({ id: uuidv4(), description: task }));
  const lowTasks = workOrderData.tasks.lowPriority.map(task => ({ id: uuidv4(), description: task }));
  const [rating, setRating] = useState(workOrderData.rating.star);
  const [ratingDescription, setRatingDescription] = useState(workOrderData.rating.description);

  const lineTotals = workOrderData.lineTotals || [
      { description: 'Home Cleaning', amount: workOrderData.price },
      { description: 'GST', amount: workOrderData.price * 0.05 }
  ];
  const headerTextStyle = {
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: '24px'
  };

  const TaskEditor = ({ tasks, taskType }) => (
    <div className="space-y-4">
      <div className="text-lg font-bold">{taskType === 'high' ? 'High Priority Tasks' : 'Low Priority Tasks'}</div>
      {tasks.map(task => (
        <div key={task.id} className="flex items-center space-x-3">
          <div
            className="flex-grow block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            {task.description}
          </div>
        </div>
      ))}
    </div>
  ); 

  const renderAccordion = () => {
    const details = [];

    //WORKORDER DETAILS
    if (workOrderData) {
      details.push(
        <Accordion
          key="wo-info"
          name="woGroup"
          id="woGroup-wo-info"
          headerText="Work Order"
          openState={true}
        >
          <div className="space-y-4 p-4">
            <div>
              <label className="block text-lg font-bold text-gray-700">{workOrderData.activity}</label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700" dateFormat="MMMM dd, yyyy">Date: {cleaningDate}</label>
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-700">
              Cost: ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(workOrderData.price)} {' (+GST)'}
            </label>
            </div>
          </div>
        </Accordion>
      );
    }
    //CLEANING TASKS
    if (highTasks.length > 0 || lowTasks.length > 0) {
      details.push(
        <Accordion
          key="tasks"
          name="woGroup"
          id="woGroup-tasks"
          headerText="Cleaning Tasks"
          openState={false}
        >
          <div className="space-y-4 p-4">
            <TaskEditor
              tasks={highTasks}
              taskType="high"
            />
            <TaskEditor
              tasks={lowTasks}
              taskType="low"
            />
          </div>
        </Accordion>
      );
    }
    return details;
  };

  const handleReceiptRequest = () => {
    let url
    // set  url from api call to node server
    return url;
  };
return (
  <div class="flex flex-col items-center justify-center flex-grow">
    <Card 
      headerText="Work Order"
      headerHiddenText={{ Hours: workOrderData.lineTotals.length, Date: workOrderData.cleaningDate }}
      state={workOrderData}
      setState={null}
      id="1"
      persistOpen={false}
    />
    <Card 
      headerText="Activity Report"
      headerHiddenText={{ Activity: workOrderData.activity, Cleaner: "Alana" }}
      state={workOrderData}
      setState={null}
      id="2"
    >
      {/**
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
      state={workOrderData}
      setState={null}
      defaultOpen={true}
      flex="col"
      id="3"
    >
      <CardInput 
        label="If you think we've earned it, we would love a 5 star review. We'll send a thank you to your cleaner of a 15% tip" 
        type="text" 
        id="rating" 
        childType="star"
        stateKey="rating.star"
        onSubmit={submitRatingToGMB}
      />
      <CardInput 
        label="Comment" 
        type="text" 
        id="ratingInput" 
        childType="input"
        stateKey="rating.description"
      />
      <div className="flex flex-row gap-4 p-2">
        <TextButton onClick={message("cleaner")} type="Button" text="Message Cleaner"/>
        <TextButton onClick={message("company")} type="Button" text="Message Select"/>
      </div>
    </Card>
  </div>
);
};

export default WorkOrderReport;

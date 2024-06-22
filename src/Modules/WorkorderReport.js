import React from 'react';
// import { useUser } from '../UserContext.js';
import Card from '../UI Elements/Card.js';
import CardInput from '../UI Elements/CardInput.js';
//import Totals from '../UI Elements/Totals.js';
import { Accordion } from '../UI Elements/Accordion.js';
//import { IconButton } from '../UI Elements/Button';
// import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { v4 as uuidv4 } from 'uuid';

/**
 * 
 * Use this componenet when not displaying sale (displaying history) 
 * 
 */

// TODO: (if Now > cleanDate), add special request
// TODO: cancel clean (if Now>24hrs befor clean)
// TODO: reschedule clean (if Now is 24hrs prior to clean, 50% cuppon)

const WorkOrderReport = ({ workOrderData }) => {
  // console.log("WorkOrderCard rendering...");
  const cleaningDate = workOrderData.cleaningDate
  const highTasks = workOrderData.tasks.highPriority.map(task => ({ id: uuidv4(), description: task }));
  const lowTasks = workOrderData.tasks.lowPriority.map(task => ({ id: uuidv4(), description: task }));

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

/*
return (
    <>
      <HeaderCard headerText="Information" headerTextStyle={headerTextStyle}>
        <div className="flex flex-col justify-end gap-4 p-4 min-h-96">
          {renderAccordion()}
        </div>
      </HeaderCard>
      <HeaderCard headerText="Total" headerTextStyle={headerTextStyle}>
        <form onSubmit={handleReceiptRequest} className="flex flex-col justify-end gap-4 p-4 min-h-96">
          <Totals totalLines={lineTotals} />
          <IconButton
            className="btn btn-primary"
            type="submit"
            text="Get Receipt"
          />
        </form>
      </HeaderCard>
    </>
  );
};
*/
return (
  <Card 
    headerText="Work Order"
    headerHiddenText={{ Hours: workOrderData.lineTotals.length, Date: workOrderData.cleaningDate }}
    state={workOrderData}
    setState={null}
  >
    <CardInput 
      label="Number of Hours" 
      type="number" 
      id="hours" 
      childType="input"
      stateKey="lineTotals.length"
    />
    <CardInput 
      label="Select Date" 
      type="text"  
      id="date" 
      childType="date"
      stateKey="cleaningDate"
    />
  </Card>
);
};

export default WorkOrderReport;

import React, { useState, useCallback, useEffect } from 'react';
import { useUser } from '../UserContext.js';
import { useWorkOrder } from '../WorkOrderContext.js';
import HeaderCard from '../UI Elements/HeaderCard';
import Totals from '../UI Elements/Totals.js';
import { Accordion } from '../UI Elements/Accordion.js';
import { IconButton } from '../UI Elements/Button';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { v4 as uuidv4 } from 'uuid';

const WorkOrderCard = ({ onSubmitWorkOrder }) => {
  // console.log("WorkOrderCard rendering...");
  const { userData, setUserData } = useUser();
  const { workOrderData, setWorkOrderData } = useWorkOrder();
  const [cleaningDate, setCleaningDate] = useState(workOrderData.cleaningDate);
  const [rate, setRate] = useState(workOrderData.price / workOrderData.hours);
  const [highTasks, setHighTasks] = useState(workOrderData.tasks.highPriority.map(task => ({ id: uuidv4(), description: task })));
  const [lowTasks, setLowTasks] = useState(workOrderData.tasks.LowPriority.map(task => ({ id: uuidv4(), description: task })));
  const [edited, setEdited] = useState({});
  const [provideEquipment, setProvideEquipment] = useState(() => {
    return workOrderData.lineTotals?.some(line => line.description === "Equipment") ?? false;
  });
  const [requests, setRequests] = useState({
    lawncare: false,
    carpetCleaning: false
  });
  const [lineTotals, setLineTotals] = useState(workOrderData.lineTotals || [
      { description: 'Home Cleaning', amount: workOrderData.price },
      { description: 'GST', amount: workOrderData.price * 0.05 }
  ]);
  const headerTextStyle = {
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: '24px'
  };

  useEffect(() => {
      // Update workOrderData.lineTotals whenever lineTotals changes
      if (lineTotals !== workOrderData.lineTotals) {
          setWorkOrderData(prev => ({
              ...prev,
              lineTotals: lineTotals
          }));
      }
  }, [lineTotals, setWorkOrderData]);

  const handleCleaningDateChange = useCallback((newDate) => {
    setCleaningDate(newDate);
    setWorkOrderData(prevData => ({
      ...prevData,
      cleaningDate: newDate
    }));
  }, [setWorkOrderData]);

  function recalculateTotalPrice(lineItems) {
    const subtotal = lineItems.reduce((sum, item) => {
        if (item.description !== "GST") {
            return sum + item.amount;
        }
        return sum;
    }, 0);

    const gstAmount = subtotal * 0.05; // Assuming GST is 10% of subtotal
    return { newPrice: subtotal + gstAmount, gstAmount };
}

  const handleAddTask = useCallback((taskType) => {
    const newTask = { id: uuidv4(), description: '' };
    if (taskType === 'high') {
      setHighTasks(tasks => [...tasks, newTask]);
    } else {
      setLowTasks(tasks => [...tasks, newTask]);
    }
  }, []);

  const handleTaskChange = useCallback((id, description, taskType) => {
    const setTasks = taskType === 'high' ? setHighTasks : setLowTasks;
    setTasks(tasks => tasks.map(task => task.id === id ? { ...task, description } : task));
  }, []);

  const handleRemoveTask = useCallback((id, taskType) => {
    const setTasks = taskType === 'high' ? setHighTasks : setLowTasks;
    setTasks(tasks => tasks.filter(task => task.id !== id));
  }, []);

  const handleWOSubmit = useCallback((e) => {
    e.preventDefault();
    onSubmitWorkOrder({
      ...workOrderData,
      cleaningDate,
      tasks: {
        highPriority: highTasks.map(task => task.description),
        LowPriority: lowTasks.map(task => task.description)
      }
    });
  }, [onSubmitWorkOrder, workOrderData, cleaningDate, highTasks, lowTasks]);

  const handleEquipmentToggle = () => {
    setProvideEquipment(prevState => !prevState);

    setLineTotals(currentLines => {
      const equipmentIndex = currentLines.findIndex(line => line.description === "Equipment");
      let newLines;

      if (equipmentIndex === -1) {
          // Add Equipment line
          const gstIndex = currentLines.findIndex(line => line.description === "GST");
          const newIndex = gstIndex === -1 ? currentLines.length : gstIndex;
          newLines = [
              ...currentLines.slice(0, newIndex),
              { description: "Equipment", amount: workOrderData.hours * 10 },
              ...currentLines.slice(newIndex)
          ];
      } else {
          // Remove Equipment line
          newLines = currentLines.filter(line => line.description !== "Equipment");
      }

      // Recalculate totals including GST
      const { newPrice, gstAmount } = recalculateTotalPrice(newLines);

      // Update or add GST line
      const gstLineIndex = newLines.findIndex(line => line.description === "GST");
      if (gstLineIndex !== -1) {
          newLines[gstLineIndex].amount = gstAmount;  // Update existing GST amount
      } else {
          // Insert new GST line just before the end or after the last non-GST item
          newLines.push({ description: "GST", amount: gstAmount });
      }

      // Update workOrderData with new lineTotals and new price
      setWorkOrderData(prevData => ({
          ...prevData,
          price: newPrice,
          lineTotals: newLines  // Update lineTotals in the context
      }));

        return newLines;
    });
};


  const handleRequestToggle = (service) => {
    setRequests(prev => ({
      ...prev,
      [service]: !prev[service]
    }));
  };

  const TaskEditor = ({ tasks, taskType }) => (
    <div className="space-y-4">
      {tasks.map(task => (
        <div key={task.id} className="flex items-center space-x-3">
          <input
            type="text"
            className="flex-grow block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={task.description}
            onChange={(e) => handleTaskChange(task.id, e.target.value, taskType)}
          />
          <button
            type="button"
            className="px-3 py-2 bg-slate-500 text-white rounded-md"
            onClick={() => handleRemoveTask(task.id, taskType)}
          >
            X
          </button>
        </div>
      ))}
      <button type="button" className="mt-2 py-2 px-4 bg-blue-500 text-white rounded-md" onClick={() => handleAddTask(taskType)}>
        + Add Task
      </button>
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
          openState={false}
        >
          <div className="space-y-4 p-4">
            <div>
              <label className="block text-md font-strong text-gray-700">{workOrderData.activity}</label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <DatePicker
                selected={cleaningDate}
                onChange={setCleaningDate}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                dateFormat="MMMM dd, yyyy"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Hours</label>
              <input
                type="text"
                name="hours"
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={workOrderData.hours}
                onChange={(e) => handleTaskChange(e.target.value, 'hours', 'info')}
                placeholder="time (in hours)"
              />
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
              onTaskChange={handleTaskChange}
              onRemoveTask={handleRemoveTask}
              onAddTask={handleAddTask}
              taskType="high"
            />
            <TaskEditor
              tasks={lowTasks}
              onTaskChange={handleTaskChange}
              onRemoveTask={handleRemoveTask}
              onAddTask={handleAddTask}
              taskType="low"
            />
          </div>
        </Accordion>
      );
    }
    //EXTRA SERVICES
    details.push(
      <Accordion
        key="wo-upsell"
        name="woGroup"
        id="woGroup-wo-upsell"
        headerText="Extra Services"
        openState={true}
      >
        <div className="flex items-center mb-4 mt-4">
            <input
              type="checkbox"
              id="provideEquipment"
              checked={provideEquipment}
              onChange={handleEquipmentToggle}
              className="checkbox text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-600"
            />
            <label htmlFor="provideEquipment" className="ml-2 text-sm font-medium text-gray-900">
              Provide Equipment (+${10*workOrderData.hours})
            </label>
        </div>
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="requestLawncare"
            checked={requests.lawncare}
            onChange={() => handleRequestToggle('lawncare')}
            className="checkbox text-green-600 focus:ring-green-500 dark:focus:ring-green-600"
          />
          <label htmlFor="requestLawncare" className="ml-2 text-sm font-medium text-gray-900">
            Request Quote for Lawn Care/Gardening Services
          </label>
        </div>
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="requestCarpetCleaning"
            checked={requests.carpetCleaning}
            onChange={() => handleRequestToggle('carpetCleaning')}
            className="checkbox text-red-600 focus:ring-red-500 dark:focus:ring-red-600"
          />
          <label htmlFor="requestCarpetCleaning" className="ml-2 text-sm font-medium text-gray-900">
            Request Quote for Carpet Cleaning
          </label>
        </div>
      </Accordion>

    );

    return details;
  };


  return (
    <>
      <HeaderCard headerText="Information" headerTextStyle={headerTextStyle}>
        <div className="flex flex-col justify-end gap-4 p-4 min-h-96">
          {renderAccordion()}
        </div>
      </HeaderCard>
      <HeaderCard headerText="Total" headerTextStyle={headerTextStyle}>
        <form onSubmit={handleWOSubmit} className="flex flex-col justify-end gap-4 p-4 min-h-96">
          <Totals totalLines={lineTotals} />
          <IconButton
            className="btn btn-primary"
            type="submit"
            text="Book Clean"
          />
        </form>
      </HeaderCard>
    </>
  );
};

export default WorkOrderCard;

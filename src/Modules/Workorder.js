import React, { useState, useCallback, useEffect } from 'react';
import { useUser } from '../UserContext.js';
import HeaderCard from '../UI Elements/HeaderCard';
import Totals from '../UI Elements/Totals.js';
import Card from '../UI Elements/Card.js';
import CardInput from '../UI Elements/CardInput.js';
import { Accordion } from '../UI Elements/Accordion.js';
import { IconButton } from '../UI Elements/Button';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { v4 as uuidv4 } from 'uuid';

const WorkOrderCard = ({ workOrderData, setWorkOrderData, onSubmitWorkOrder, setEdited }) => {
  // console.log("WorkOrderCard rendering...");
  const { userData, setUserData } = useUser();
  const [cleaningDate, setCleaningDate] = useState(workOrderData.cleaningDate);
  const [rate, setRate] = useState(workOrderData.price / workOrderData.hours);
  const [highTasks, setHighTasks] = useState(workOrderData.tasks.highPriority.map(task => ({ id: uuidv4(), description: task })));
  const [lowTasks, setLowTasks] = useState(workOrderData.tasks.lowPriority.map(task => ({ id: uuidv4(), description: task })));
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
        lowPriority: lowTasks.map(task => task.description)
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
      <div className="text-lg font-bold">
        {taskType === 'high' ? 'High Priority Tasks' : 'Low Priority Tasks'}
      </div>
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


  return (
    <>  
      <div class="flex flex-col items-center justify-center flex-grow">
        <Card 
          headerText="Work Order"
          headerHiddenText={{ Hours: workOrderData.lineTotals.length, Date: workOrderData.cleaningDate }}
          state={workOrderData}
          setState={null}
          id="1"
          persistOpen={false}
        >
          <CardInput 
            label="Hours" 
            type="text" 
            id="hours" 
            childType="input"
            stateKey="lineTotals.length"
            setEdited={setEdited}
          />
          <CardInput 
            label="Date" 
            type="date" 
            id="date" 
            childType="input"
            stateKey="cleaningDate"
            setEdited={setEdited}
          />
        </Card>
        <Card 
        headerText="Cleaning Tasks"
        headerHiddenText=""
        state={workOrderData}
        setState={null}
        flex="col"
        id="2"
        >
          <CardInput 
            label="" 
            type="" 
            id="cleaningTasks" 
            childType="chit"
            stateKey="tasks"
            setEdited={setEdited}
          />
        </Card>
        {/*
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
        */}
      </div>
    </>
  );
};

export default WorkOrderCard;

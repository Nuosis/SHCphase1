import React, { useState, useCallback, useEffect } from 'react';
import { useUser } from '../UserContext.js';
import Card from '../UI Elements/Card.js';
import CardInput from '../UI Elements/CardInput.js';
import { v4 as uuidv4 } from 'uuid';
import {TextButton} from '../UI Elements/Button';

const WorkOrderCard = ({ workOrderData, setWorkOrderData, handleComponentSelect, setEdited }) => {
  // console.log("WorkOrderCard rendering...");
  // console.log({workOrderData});

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

  const [lineTotals, setLineTotals] = useState(workOrderData.lineTotals);

  useEffect(() => {
    if (lineTotals.length !== 0 && lineTotals !== workOrderData.lineTotals) {
      console.log("workOrderLines updating...");
      setWorkOrderData(prev => ({
        ...prev,
        lineTotals: lineTotals
      }));
    }
  }, [lineTotals, workOrderData, setWorkOrderData]);

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
      <div className="flex flex-col items-center justify-center flex-grow">
        {
          //console.log("workOrderData at render:", workOrderData)
        }
        <Card 
          headerText="Work Order"
          headerHiddenText={{ Hours: workOrderData.hours, Date: workOrderData.cleaningDate }}
          state={workOrderData}
          setState={null}
          id="1"

        >
          <CardInput 
            label="Hours" 
            type="text" 
            id="hours" 
            childType="input"
            state={workOrderData}
            stateKey="hours"
            setEdited={setEdited}
          />
          <CardInput 
            label="Date" 
            type="date" 
            id="date" 
            childType="input"
            state={workOrderData}
            stateKey="cleaningDate"
            setEdited={setEdited}
          />
        </Card>
        <Card 
        headerText="Cleaning Tasks"
          headerHiddenText={{ToDo: "Ability to add item inline"}}
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
            state={workOrderData}
            stateKey="tasks"
            setEdited={setEdited}
          />
        </Card>
        <Card 
          headerText="Additional Details"
          headerHiddenText={{ToDo: 'here we need to add icon grid for up-sell and !!includeEquipment!! This should be default open'}}
          state={workOrderData}
          setState={null}
          id="3"
        />
        <Card 
          headerText="Add Comment"
          headerHiddenText={{ToDo: "Let's add a comment input"}}
          state={workOrderData}
          setState={null}
          id="3"
        />
        <div className="flex">
          <div class="flex flex-grow w-full gap-4 justify-items-start">
            <TextButton
                icon="AddCircle"
                className="btn btn-primary self-end"
                type="button"
                text="My Pets"
                onClick={() => handleComponentSelect('MyPets')}
            />
            <TextButton
                icon="AddCircle"
                className="btn btn-primary self-end"
                type="button"
                text="General Instructions"
                onClick={() => handleComponentSelect('GeneralInstructions')}
            />
            <TextButton
                icon="AddCircle"
                className="btn btn-primary self-end"
                type="button"
                text="Access Instructions"
                onClick={() => handleComponentSelect('AccessCard')}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default WorkOrderCard;

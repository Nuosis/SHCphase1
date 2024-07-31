import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useUser } from '../UserContext.js';
import CardContainer from '../UI Elements/CardContainer';
import CardInput from '../UI Elements/CardInput.js';
import { v4 as uuidv4 } from 'uuid';
import { TextButton } from '../UI Elements/Button';
import { Delete, AddCircle } from '@mui/icons-material';

const WorkOrderCard = ({ workOrderData, setWorkOrderData, handleComponentSelect, setEdited }) => {
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

  const equipmentOptions = [
    {
      "id": 1,
      "name": "Valcume Cleaner",
      "price": 35,
      "imagePath": "equipment-vacuum.png"
    },
    {
      "id": 2,
      "name": "Washing Machine",
      "price": 48,
      "imagePath": "equipment-washing-machine.png"
    },
    {
      "id": 3,
      "name": "Tools",
      "price": 12,
      "imagePath": "equipment-tools.png"
    }
  ];

  const [lineTotals, setLineTotals] = useState(workOrderData.lineTotals);

  const inputRefs = useRef({});  // Use refs to keep track of input elements

  const handleTaskChange = useCallback((id, description, taskType) => {
    const setTasks = taskType === 'high' ? setHighTasks : setLowTasks;
    setTasks(tasks => tasks.map(task => task.id === id ? { ...task, description } : task));
  }, []);

  const handleRemoveTask = useCallback((id, taskType) => {
    const setTasks = taskType === 'high' ? setHighTasks : setLowTasks;
    setTasks(tasks => tasks.filter(task => task.id !== id));
  }, []);

  const handleAddTask = useCallback((taskType) => {
    const newTask = { id: uuidv4(), description: '' };
    if (taskType === 'high') {
      setHighTasks(tasks => [...tasks, newTask]);
    } else {
      setLowTasks(tasks => [...tasks, newTask]);
    }
  }, []);

  // Function to check if equipment is selected
  const isEquipmentSelected = (workOrderData, equipment) => {
    return workOrderData.lineTotals.findIndex(item => item.description === equipment.name) !== -1;
  };

  const handleSelectEquipment = useCallback((workOrderData, equipment) => {
    const newLineTotals = [...workOrderData.lineTotals]; // Create a copy of the lineTotals array
  
    // Find the index of the equipment in the lineTotals array
    const equipmentIndex = newLineTotals.findIndex(item => item.description === equipment.name);
  
    if (equipmentIndex !== -1) {
      // If equipment is found, remove it from lineTotals
      newLineTotals.splice(equipmentIndex, 1);
    } else {
      // If equipment is not found, add it to lineTotals
      newLineTotals.push({
        description: equipment.name,
        amount: equipment.price,
        hours: null // or specify hours if relevant for the equipment
      });
    }
  
    // Recalculate the total price (excluding GST for simplicity)
    const subtotal = newLineTotals.reduce((total, item) => item.description !== "GST" ? total + item.amount : total, 0);
    
    // Find the GST line item if it exists
    let gstItem = newLineTotals.find(item => item.description === "GST");
  
    if (gstItem) {
      // Recalculate GST based on subtotal
      gstItem.amount = subtotal * 0.05; // Assuming GST is 5%
    } else {
      // Add GST line item if it doesn't exist
      newLineTotals.push({
        description: "GST",
        amount: subtotal * 0.05
      });
    }
  
    // Update the total price including GST
    const newPrice = subtotal + (gstItem ? gstItem.amount : subtotal * 0.05);
  
    // Update workOrderData state with the new line totals and price
    setWorkOrderData(prevData => ({
      ...prevData,
      lineTotals: newLineTotals,
      price: newPrice
    }));
  }, [setWorkOrderData]);

  useEffect(() => {
    const focusedId = inputRefs.current.focusedId;
    if (focusedId && inputRefs.current[focusedId]) {
      inputRefs.current[focusedId].focus();
    }
  });

  const handleFocus = (id) => {
    inputRefs.current.focusedId = id;
  };

  const TaskEditor = ({ tasks, taskType }) => (
    <div className="space-y-4 mr-8">
      <div className="text-lg font-bold">
        {taskType === 'high' ? 'High Priority Tasks' : 'Low Priority Tasks'}
      </div>
      {tasks.map((task) => (
        <div key={task.id} className="flex items-center space-x-3">
          <input
            ref={(input) => inputRefs.current[task.id] = input}
            type="text"
            className="flex-grow block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={task.description}
            onChange={(e) => handleTaskChange(task.id, e.target.value, taskType)}
            onFocus={() => handleFocus(task.id)}
          />
          <button
            type="button"
            className="btn dark:btn-outline dark:text-gray-500 btn-sm ml-4 p-2 min-h-10"
            onClick={() => handleRemoveTask(task.id, taskType)}
          >
            <Delete/>
          </button>
        </div>
      ))}
      <button type="button" className="bg-primary text-white px-4 py-2 inline-flex rounded-md " style={{"margin-top":"2rem"}} onClick={() => handleAddTask(taskType)}>
        <AddCircle/>&nbsp;&nbsp;Add Task
      </button>
    </div>
  );

  const EquipmentEditor = ({ provideEquipment }) => (
    <div className="space-y-4 mr-8">
      <div className="text-lg font-bold">
        Select Equipment
      </div>
      <div className="flex flex-wrap gap-3">
        {equipmentOptions.map((equipment) => {
          let isSelected = isEquipmentSelected(workOrderData, equipment);
          return (
            <a
              className={`flex items-center border border-solid rounded-md border-color-primary py-1 px-2 hover:bg-primary hover:text-white ${isSelected ? 'bg-primary text-white' : ''}`}
              onClick={() => handleSelectEquipment(workOrderData, equipment)}
            >
              <img src={equipment.imagePath} className="w-12 mr-2" alt={equipment.name} />
              <label>{equipment.name} <em>(+ ${equipment.price} )</em></label>
            </a>
          );
        })}
      </div>
    </div>
  );

  console.log('workOrderData', workOrderData);

  const cardsData = [
    {
      id: "1",
      headerText: "Work Order",
      headerHiddenText: { Hours: workOrderData.hours, Date: workOrderData.cleaningDate },
      state: workOrderData,
      setState: setWorkOrderData,
      flex: "row",
      children: (
        <>
          <CardInput 
            label="Hours" 
            type="text" 
            id="hours" 
            childType="field"
            inputClass="w-16"
            parentClass="space-y-4 mr-8"
            state={workOrderData}
            stateKey="hours"
            setEdited={setEdited}
          />
          <CardInput 
            label="Date" 
            type="date" 
            id="date" 
            childType="field"
            inputClass="w-40"
            parentClass="space-y-4 mr-8"
            state={workOrderData}
            stateKey="cleaningDate"
            setEdited={setEdited}
          />
        </>
      )
    },
    {
      id: "2",
      headerText: "Cleaning Tasks",
      headerHiddenText: { 'Total Tasks': highTasks.length + lowTasks.length },
      state: workOrderData,
      setState: setWorkOrderData,
      children: (
        <>
          <TaskEditor tasks={highTasks} taskType="high" />
          <TaskEditor tasks={lowTasks} taskType="low" />
        </>
      )
    },
    {
      id: "3",
      headerText: "Additional Details",
      headerHiddenText: { ToDo: 'here we need to add icon grid for up-sell' },
      flex: "row",
      state: workOrderData,
      setState: setWorkOrderData,
      defaultOpen: true,
      children: (
        <>
          <EquipmentEditor provideEquipment={provideEquipment} />
        </>
      )
    },
    {
      id: "4",
      headerText: "Add Comment",
      headerHiddenText: { ToDo: "Let's add a comment input" },
      flex: "row",
      state: workOrderData,
      setState: setWorkOrderData,
      children: <></>,
    }
  ];

  return (
    <div className="flex-grow items-stretch justify-center flex-grow">
      <CardContainer cardsData={cardsData} />
      <div className="flex">
        <div className="flex flex-grow w-full gap-4 justify-center">
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
  );
};

export default WorkOrderCard;
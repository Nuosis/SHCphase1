import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useUser } from '../Contexts/UserContext.js';
import CardContainer from '../UI Elements/CardContainer';
import CardInput from '../UI Elements/CardInput.js';
import { v4 as uuidv4 } from 'uuid';
// import { TextButton } from '../UI Elements/Button';
import { Delete, AddCircle } from '@mui/icons-material';

const WorkOrderCard = ({ workOrderData, setWorkOrderData, handleComponentSelect, setEdited }) => {
  const { userData, setUserData } = useUser();
  const [cleaningDate, setCleaningDate] = useState(workOrderData.cleaningDate);
  const [highTasks, setHighTasks] = useState(workOrderData.tasks.highPriority.map(task => ({ id: uuidv4(), description: task })));
  const [lowTasks, setLowTasks] = useState(workOrderData.tasks.lowPriority.map(task => ({ id: uuidv4(), description: task })));
  const [provideEquipment, setProvideEquipment] = useState(() => {
    return workOrderData.lineTotals?.some(line => line.description === "Equipment") ?? false;
  });
  const [requests, setRequests] = useState({
    lawncare: false,
    carpetCleaning: false
  });

  const additionalItems = [
    {
      id: 1,
      name: "Cleaner Provides Equipment",
      price: 10,
      priceType: "hour",
      priceDescription: "+ $10 per hour",
      imagePath: "vacume.svg"
    },
    {
      id: 2,
      name: "Request Carpet Clean Quote",
      price: 0,
      priceDescription: "",
      priceType: "fixed",
      imagePath: "carpet-clean.svg"
    },
    {
      id: 3,
      name: "Request Maintenance Quote",
      price: 0,
      priceDescription: "",
      priceType: "fixed",
      imagePath: "repair.svg"
    }
  ];

  const cleaningHourPrice = 80;

  const [lineTotals, setLineTotals] = useState(workOrderData.lineTotals);
  const inputRefs = useRef({});  // Use refs to keep track of input elements
  const [focusedTaskId, setFocusedTaskId] = useState(null); // State to track the newly added task's id

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
    setFocusedTaskId(newTask.id); // Set the id of the newly added task to focus
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
        amount: equipment.priceType === "hour" ? equipment.price * workOrderData.hours : equipment.price,
        perHour: equipment.price
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
    const updateLineTotals = () => {
      // Create a copy of the current line totals
      let newLineTotals = [...workOrderData.lineTotals];
  
      // Reset the price to 0 before recalculating
      let newPrice = 0;
  
      newLineTotals.forEach(function(line) {
        console.log(line);
        if (line.description === "Home Cleaning") {
          // Update Home Cleaning amount
          line.amount = cleaningHourPrice * workOrderData.hours;
        } else if (line.perHour) {
          line.amount = line.perHour * workOrderData.hours;
        } else {
        }
      });
  
      // Calculate subtotal excluding GST
      const subtotal = newLineTotals.reduce((total, item) => item.description !== "GST" ? total + item.amount : total, 0);
  
      // Handle GST calculation
      let gstItem = newLineTotals.find(item => item.description === "GST");
      if (gstItem) {
        // Recalculate GST based on the new subtotal
        gstItem.amount = subtotal * 0.05;
      } else {
        // Add GST line item if it doesn't exist
        gstItem = {
          description: "GST",
          amount: subtotal * 0.05
        };
        newLineTotals.push(gstItem);
      }
  
      // Calculate the final price including GST
      newPrice = subtotal + gstItem.amount;
  
      // Update workOrderData state with the new line totals and price
      setWorkOrderData(prevData => ({
        ...prevData,
        lineTotals: newLineTotals,
        price: newPrice
      }));
    };
  
    updateLineTotals();
  }, [workOrderData.hours, setWorkOrderData]);

  useEffect(() => {
    if (focusedTaskId && inputRefs.current[focusedTaskId]) {
      inputRefs.current[focusedTaskId].focus();
    }
  }, [focusedTaskId]);

  const handleFocus = (id) => {
    inputRefs.current.focusedId = id;
    setFocusedTaskId(id);
  };

  const TaskEditor = ({ tasks, taskType }) => {
    return (
      <div>
        <div className="text-lg mb-4">
          {taskType === 'high' ? 'High Priority Tasks' : 'Low Priority Tasks'}
        </div>
        <div className="gap-4 flex flex-wrap pb-4">
          {tasks.map((task) => (
            <div key={task.id} className="flex">
              <input
                ref={(input) => {
                  inputRefs.current[task.id] = input;
                  if (focusedTaskId === task.id) {
                    input?.focus();
                  }
                }}
                type="text"
                className="w-52 px-3 py-2 bg-white text-black dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600 border border-gray-300 rounded-lg shadow-sm"
                value={task.description}
                onChange={(e) => handleTaskChange(task.id, e.target.value, taskType)}
                onFocus={() => handleFocus(task.id)}
              />
              <button
                type="button"
                className="btn items-center rounded-l-none text-base animate-none dark:text-gray-500 btn-sm p-2 min-h-10"
                style={{ margin: '1px 0px 1px -2.7rem', minHeight: '2.6rem', borderTopRightRadius: '7px', borderBottomRightRadius: '7px' }}
                onClick={() => handleRemoveTask(task.id, taskType)}
              >
                <Delete />
              </button>
            </div>
          ))}
          <button type="button" className="bg-white text-primary dark:bg-gray-600 dark:text-gray-400 dark:border-gray-700 border border-gray-300 px-4 py-2 items-center rounded-md hover:bg-primary hover:text-white" onClick={() => handleAddTask(taskType)}>
            <AddCircle />&nbsp;&nbsp;Add Task
          </button>
        </div>
      </div>
    );
  };

  const EquipmentEditor = ({ provideEquipment }) => (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-6 justify-left">
        {additionalItems.map((equipment) => {
          let isSelected = isEquipmentSelected(workOrderData, equipment);
          return (
            <div
              key={equipment.id}
              className={`flex flex-col w-40 items-center justify-center border border-solid rounded-md border-color-primary py-2 px-2 text-black hover:cursor-pointer dark:bg-gray-600 dark:text-gray-400 dark:border-gray-700 hover:text-white ${
                isSelected ? 'bg-primary text-white dark:bg-primary dark:text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-500'
              }`}
              onClick={() => handleSelectEquipment(workOrderData, equipment)}
            >
              <img src={equipment.imagePath} className="w-16 mb-2" alt={equipment.name} />
              <label className="text-center text-xs text-gray-400">
                {equipment.name}
                {equipment.price > 0 && <em><br/>({equipment.priceDescription})</em>}
              </label>
            </div>
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
            type="number" 
            id="hours" 
            childType="field"
            inputClass="w-16"
            parentClass="space-y-4 mr-8"
            state={workOrderData}
            setState={setWorkOrderData}
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
            setState={setWorkOrderData}
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
      headerHiddenText: { 'Selected Items': workOrderData.lineTotals.length - 2 },
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
      headerHiddenText: { 'Comment': workOrderData.comment ? 'Provided' : 'No Comment' },
      flex: "row",
      state: workOrderData,
      setState: setWorkOrderData,
      children: (
      <>
      <CardInput 
          type="textarea" 
          childType="field"
          inputClass="textarea text-black textarea-bordered w-full flex-grow overflow-y-auto dark:bg-gray-600 dark:text-gray-400 dark:border-gray-700"
          placeholder="Add comment..."
          value={workOrderData.comment}
          parentClass="grow"
          state={workOrderData}
          setState={setWorkOrderData}
          stateKey="comment"
          setEdited={setEdited}
        />
      </>
      ),
    }
  ];

  return (
    <div className="items-stretch justify-center flex-grow">
      <CardContainer cardsData={cardsData} />
    </div>
  );
};

export default WorkOrderCard;
import React, { useState } from 'react';
import { useAuth } from '../AuthContext.js';
import { Close, Delete } from '@mui/icons-material';
import StarRating from '../UI Elements/StarRating.js';
import Popup from '../UI Elements/Popup.js'
import { useUser } from '../UserContext.js';
import { deleteRecord } from '../FileMaker/deleteRecord.js'
import { readRecord } from '../FileMaker/readRecord.js'

const icons = {Close, Delete};
const getValue = (state, path) => {
  // console.log('Initial State:', state);
  try {
      // eslint-disable-next-line no-useless-escape
      const pathParts = path.match(/([^\.\[\]]+|\[\d+\])/g); // This regex matches property names and array indices
      return pathParts.reduce((acc, part) => {
          const match = part.match(/\[(\d+)\]/); // Check if the part is an array index
          if (match) {
              return acc ? acc[parseInt(match[1])] : undefined; // Access the array index
          }
          return acc ? acc[part] : undefined; // Access the property
      }, state);
  } catch (error) {
      console.error(`Error navigating state with key ${path}:`, error);
      return ''; // Return a default/fallback value
  }
}
const CardInput = (
    { 
      label, 
      type = 'text', 
      id, 
      childType, 
      state, 
      setState, 
      stateKey,
      setEdited,
      onNew,
      value,
      placeholder
    }
  ) => {
    // Local state to keep track of the input value
    const [inputValue, setInputValue] = useState(!value ? getValue(state, stateKey):value);
    const [popup, setPopup] = useState({ show: false, message: '' });
    const { authState } = useAuth();
    const { getUserData } = useUser();

    const handleChange = (e) => {
      // console.log("handleChange", e.target.value)
        setInputValue(e.target.value); // Update local state immediately
    };

    const handleBlur = (e) => {
      console.log("handleBlur...")
      const newValue = e.target.value;
      const oldValue = getValue(state, stateKey);
  
      // Check if the value has changed before updating the global state and setting edited
      if (newValue !== oldValue) {
          const updatedState = { ...state };
          const keys = stateKey.split('.');
          let current = updatedState;
  
          // Navigate to the correct location in the state object
          for (let i = 0; i < keys.length - 1; i++) {
              const key = keys[i];
              // Check if the next key indicates an array index
              if (key.includes('[') && key.includes(']')) {
                  const index = parseInt(key.match(/\d+/)[0]); // Extract the index from the string like "home[0]"
                  const arrayKey = key.split('[')[0]; // Get the key name like "home" from "home[0]"
                  if (!current[arrayKey]) {
                      current[arrayKey] = []; // Initialize as an array if not exist
                  }
                  if (!current[arrayKey][index]) {
                      current[arrayKey][index] = {}; // Ensure object exists at the index
                  }
                  current = current[arrayKey][index];
              } else {
                  if (!current[key]) {
                      current[key] = {}; // Ensure nested objects exist
                  }
                  current = current[key];
              }
          }
  
          // Update the value at the final key
          current[keys[keys.length - 1]] = newValue;
          setState(updatedState);
  
          // Prepare edit info and update the edited state
          const editInfo = {
              action: "update",
              path: stateKey,
              value: newValue
          };
          setEdited(prevEdits => [...prevEdits, editInfo]);
      } else {
        // Blur the input element if the value hasn't changed
        e.target.blur();
      }
    };

    const handleTelBlur = (e) => {
      console.log("handleTelBlur...")
      const newValue = e.target.value;
      let digits = newValue.replace(/\D/g, '');
      if(digits.length!==10){
        setPopup({ show: true, message: "Telephone numbers must be 10 digits long: '(nnn) nnn-nnnn'" });
        return
      }
      digits = `+${digits}`
      console.log({digits})
      const oldValue = getValue(state, stateKey);
  
      // Check if the value has changed before updating the global state and setting edited
      if (digits !== oldValue) {
          const updatedState = { ...state };
          const keys = stateKey.split('.');
          let current = updatedState;
  
          // Navigate to the correct location in the state object
          for (let i = 0; i < keys.length - 1; i++) {
              const key = keys[i];
              // Check if the next key indicates an array index
              if (key.includes('[') && key.includes(']')) {
                  const index = parseInt(key.match(/\d+/)[0]); // Extract the index from the string like "home[0]"
                  const arrayKey = key.split('[')[0]; // Get the key name like "home" from "home[0]"
                  if (!current[arrayKey]) {
                      current[arrayKey] = []; // Initialize as an array if not exist
                  }
                  if (!current[arrayKey][index]) {
                      current[arrayKey][index] = {}; // Ensure object exists at the index
                  }
                  current = current[arrayKey][index];
              } else {
                  if (!current[key]) {
                      current[key] = {}; // Ensure nested objects exist
                  }
                  current = current[key];
              }
          }
  
          // Update the value at the final key
          current[keys[keys.length - 1]] = digits;
          setState(updatedState);
  
          // Prepare edit info and update the edited state
          const editInfo = {
              action: "update",
              path: stateKey,
              value: digits
          };
          setEdited(prevEdits => [...prevEdits, editInfo]);
      } else {
        // Blur the input element if the value hasn't changed
        e.target.blur();
      }
    };

    const handlePDF_Click = (e) => {console.log("pdf click")}
    
    const handleIconClick = (e) => {console.log("icon click")}

    const handleChitDelete = (key, task) => {
      //TODO: update userData state first
      setEdited("delete",stateKey);
    };
  
    const camelCaseToTitleCase = (str) => {
      return str.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
    };

    function toTitleCase(str) {
      return str.replace(
          /\w\S*/g,
          function(txt) {
              return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
          }
      );
    }

    if (childType === "chit") {
      const DeleteIcon = icons.Close;
      const keys = stateKey.split('.').reduce((acc, key) => acc[key], state);

      return (
        <>
          {Object.keys(keys).map((key) => {
            const value = keys[key];
            if (!Array.isArray(value)) {
              return null;
            }

            const titleCaseLabel = camelCaseToTitleCase(key);
            const tasks = value;

            return (
              <div key={key} className="flex flex-col">
                <label className="block text-gray-400 mb-2 font-medium">{titleCaseLabel}</label>
                <div className="flex flex-wrap gap-2">
                  {tasks.map((task, index) => (
                    <div className="mb-8" key={index}>
                      <div className="flex items-center justify-between bg-blue-50 text-slate-400 rounded-full shadow-lg gap-2 px-4 py-2">
                        <span>{task}</span>
                        <DeleteIcon className="align-center items-center" onClick={() => handleChitDelete(stateKey, index)}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </>
      );
    } else if(childType==="iconGrid"){
      return (
        <div className="mr-8">
          <label htmlFor={id} className="block text-gray-400 mb-2 font-medium">{label}</label>
          <input 
            type={type} 
            id={id} 
            className="max-w-20 p-2 border rounded" 
            onClick={handleIconClick} 
          />
        </div>
      );
    } else if(childType==="star"){
      return (
        <div className="">
          <label htmlFor={id} className="block text-gray-400 mb-2 font-medium">{label}</label>
          <StarRating 
            rating={stateKey.split('.').reduce((acc, key) => acc[key], state)} 
            setRating={handleChange} 
          />
        </div>
      );
    } else if(childType==="input"){
      return (
        <div className="">
          {popup.show && (
            <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50" style={{ zIndex: 30 }}>
                <Popup message={popup.message} onClose={() => setPopup({ ...popup, show: false })} />
            </div>
          )}
          <label htmlFor={id} className="block text-gray-400 mb-2 font-medium">{toTitleCase(label)}</label>
          <input 
            type={type} 
            id={id} 
            className="max-w-full min-h-40 p-2 dark:bg-gray-600 dark:text-gray-400 dark:border-gray-700 border rounded" 
            value={!value ? getValue(state, stateKey):value}
            onBlur={handleBlur} 
            onChange={handleChange}
          />
        </div>
      );
    } else if(childType==="pdf"){
      return (
        <div className="">
          <label htmlFor={id} className="block text-gray-400 mb-2 font-medium">{label}</label>
          <input 
            type={type} 
            id={id} 
            className="max-w-20 p-2 border rounded" 
            onClick={handlePDF_Click} 
          />
        </div>
      );
    } else if(childType==="textarea"){
      return (
        <div className="">
          {popup.show && (
            <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50" style={{ zIndex: 30 }}>
                <Popup message={popup.message} onClose={() => setPopup({ ...popup, show: false })} />
            </div>
          )}
          <label htmlFor={id} className="block text-gray-400 mb-2 font-medium">{toTitleCase(label)}</label>
          <input 
            id={id} 
            className="block p-2 input input-bordered dark:bg-gray-600 dark:text-gray-400 dark:border-gray-700 border rounded w-full"
            placeholder={placeholder}
            value={!value ? getValue(state, stateKey):value}
            onBlur={handleBlur} 
            onChange={handleChange}
          />
        </div>
      );
    } else if(childType==="tel"){
      return (
        <div className="grow">
          {/* Overlay and POPUP */}
          {popup.show && (
            <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50" style={{ zIndex: 30 }}>
                <Popup message={popup.message} onClose={() => setPopup({ ...popup, show: false })} />
            </div>
          )}
          <label htmlFor={id} className="block text-gray-400 font-medium">{toTitleCase(label)}</label>
          {onNew ? (
          <div className="flex flex-row">
            <input 
            type={type} 
            id={id} 
            className="p-2 mb-2 w-11/12 input input-bordered dark:bg-gray-600 dark:text-gray-400 dark:border-gray-700 border rounded" 
            value={inputValue}
            onBlur={handleTelBlur} 
            onChange={handleChange}
            />
          </div>
          ) : (
            <input 
              type={type} 
              id={id} 
              className="p-2 mb-2 w-full input input-bordered dark:bg-gray-600 dark:text-gray-400 dark:border-gray-700 border rounded" 
              value={inputValue}
              onBlur={handleBlur} 
              onChange={handleChange}
            />
        )}
        </div>
      );
    } else {
    return (
      <div className="grow">
        {/* Overlay and POPUP */}
        {popup.show && (
          <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50" style={{ zIndex: 30 }}>
              <Popup message={popup.message} onClose={() => setPopup({ ...popup, show: false })} />
          </div>
        )}
        <label htmlFor={id} className="text-gray-400 font-medium">{toTitleCase(label)}</label>
        {onNew ? (
          <div className="flex flex-row">
            <input 
            type={type} 
            id={id} 
            className="p-2 mb-2 w-11/12 input input-bordered dark:bg-gray-600 dark:text-gray-400 dark:border-gray-700 border rounded" 
            value={inputValue}
            onBlur={handleBlur} 
            onChange={handleChange}
            />
          </div>
          ) : (
            <input 
              type={type} 
              id={id} 
              className="p-2 mb-2 w-full input input-bordered dark:bg-gray-600 dark:text-gray-400 dark:border-gray-700 border rounded" 
              value={inputValue}
              onBlur={handleBlur} 
              onChange={handleChange}
            />
        )}
      </div>
  )};
};

export default CardInput;

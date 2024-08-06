import React, { useState } from 'react';
import { Close, Delete } from '@mui/icons-material';
import StarRating from '../UI Elements/StarRating.js';
import Popup from '../UI Elements/Popup.js'

const icons = {Close, Delete};
const getValue = (state, path) => {
  // console.log('getValue ...', state,path);
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
      key,
      childType, 
      state, 
      setState, 
      stateKey,
      setEdited,
      onNew,
      value,
      placeholder,
      inputClass,
      parentClass
    }
  ) => {
    // Local state to keep track of the input value
    console.log("CardInput is rendering...",{state,stateKey,childType})
    const [inputValue, setInputValue] = useState(!value ? getValue(state, stateKey):value);
    const [popup, setPopup] = useState({ show: false, message: '' });
    const [file, setFile] = useState(null);

    const handleLocalChange = (e) => {
      console.log("handleLocalChange", e.target.value)
        setInputValue(e.target.value); // Update local state immediately
    };

    const handleStateChange = (e) => {
      console.log("handleStateChange...")
      const newValue = e && e.target && e.target.value !== undefined ? e.target.value : e;
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

    const handleFileChange = (event) => {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result.split(',')[1];
        // Here you can directly handle the base64 data within the CardInput component
        console.log('Base64 data:', base64data);
        // setBase64Data(base64data); // If you want to store it in the state
        // Additional logic to handle the file data, such as uploading it to FileMaker
      };
      reader.readAsDataURL(selectedFile);
    };
    

    const handlePDF_Click = (e) => {console.log("pdf click")}
    
    const handleIconClick = (e) => {console.log("icon click")}

    const handleChitDelete = (key, task) => {
      setEdited("delete",stateKey);
      //TODO: update userData state
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
      const keys = stateKey.split('.').reduce((acc, key) => {
        if (acc && acc[key] !== undefined) {
          return acc[key];
        } else {
          // Handle the case where the key does not exist
          console.error(`Key ${key} does not exist in state ${state}`);
          return undefined;
        }
      }, state);

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
                <label className="block text-sm font-bold text-primary dark:text-gray-400">{titleCaseLabel}</label>
                <div className="flex flex-wrap gap-2">
                  {tasks.map((task, index) => (
                    <div className="mb-8" key={index}>
                      <div className=" mt-2 flex items-center justify-between bg-blue-50 text-slate-400 rounded-full shadow-lg gap-2 px-4 py-2">
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
        <div className={parentClass}>
          <label htmlFor={`${type}-${label}-${id}`} className="block text-sm font-bold text-primary dark:text-gray-400">{label}</label>
          <input 
            type={type} 
            id={id} 
            className="max-w-20 mt-2 p-2 border rounded" 
            onClick={handleIconClick} 
          />
        </div>
      );
    } else if(childType==="star"){
      // console.log("star rating",inputValue, {state}, {stateKey})
      const rate = getValue(state,stateKey)
      // console.log(rate)
      return (
        <div className={parentClass}>
          <label htmlFor={id} className="block text-sm font-bold text-primary dark:text-gray-400">{label}</label>
          <StarRating 
            rating={rate}
            setRating={handleStateChange} 
          />
        </div>
      );
    } else if(childType==="input"){
      return (
        <div className={parentClass}>
          {popup.show && (
            <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50" style={{ zIndex: 30 }}>
                <Popup message={popup.message} onClose={() => setPopup({ ...popup, show: false })} />
            </div>
          )}
          <label htmlFor={`label-${type}-${label}-${id}`} className="block text-sm font-bold text-primary dark:text-gray-400">{toTitleCase(label)}</label>
          <input 
            type={type} 
            id={`${type}-${label}-${id}`}
            className={"max-w-full mt-2 min-h-12 p-2 dark:bg-gray-600 text-black dark:text-gray-400 dark:border-gray-700 border rounded " + inputClass }
            value={!value ? getValue(state, stateKey):value}
            onBlur={handleStateChange} 
            onChange={handleLocalChange}
          />
        </div>
      );
    } else if(childType==="pdf"){
      return (
        <div className={parentClass}>
          <label htmlFor={id} className="block text-sm font-bold text-primary dark:text-gray-400">{label}</label>
          <input 
            type={type} 
            id={`${type}-${label}-${id}`} 
            className={"max-w-20 mt-2 p-2 border rounded text-black " + inputClass }
            onClick={handlePDF_Click} 
          />
        </div>
      );
    } else if (childType === "fileUpload") {
      return (
        <div>
          <label htmlFor={id} className="block text-sm font-bold text-primary dark:text-gray-400">{label}</label>
          <input
            type="file"
            id={`${type}-${label}-${id}`}
            className="max-w-full mt-2 p-2 dark:bg-gray-600 text-black dark:text-gray-400 dark:border-gray-700 border rounded"
            onChange={handleFileChange}
          />
          {file && <p>{file.name}</p>}
        </div>
      );
    } else if(childType==="textarea"){
      return (
        <div className={parentClass}>
          {popup.show && (
            <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50" style={{ zIndex: 30 }}>
                <Popup message={popup.message} onClose={() => setPopup({ ...popup, show: false })} />
            </div>
          )}
          <label htmlFor={`label-${type}-${label}-${id}`} className="block text-gray-400 mb-2 font-medium">{toTitleCase(label)}</label>
          <input 
            id={`${type}-${label}-${id}`} 
            className={"block mt-2 p-2 input input-bordered dark:bg-gray-600 text-black  dark:text-gray-400 dark:border-gray-700 border rounded " + inputClass }
            placeholder={placeholder}
            value={inputValue}
            onBlur={handleStateChange} 
            onChange={handleLocalChange}
          />
        </div>
      );
    } else if(childType==="tel"){
      return (
        <div className={parentClass}>
          {/* Overlay and POPUP */}
          {popup.show && (
            <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50" style={{ zIndex: 30 }}>
                <Popup message={popup.message} onClose={() => setPopup({ ...popup, show: false })} />
            </div>
          )}
          <label htmlFor={`label-${type}-${label}-${id}`} className="block text-sm font-bold text-primary dark:text-gray-400">{toTitleCase(label)}</label>
          {onNew ? (
            <input 
            type={type} 
            id={`${type}-${label}-${id}`} 
            className={"mt-2 p-2 mb-2 w-11/12 input input-bordered text-black dark:bg-gray-600 dark:text-gray-400 dark:border-gray-700 border rounded " + inputClass }
            value={inputValue}
            onBlur={handleTelBlur} 
            onChange={handleLocalChange}
            />
          ) : (
            <input 
              type={type} 
              id={`${type}-${label}-${id}`} 
              className={"mt-2 p-2 mb-2 w-full input input-bordered text-black  dark:bg-gray-600 dark:text-gray-400 dark:border-gray-700 border rounded " + inputClass } 
              value={inputValue}
              onBlur={handleStateChange} 
              onChange={handleLocalChange}
            />
        )}
        </div>
      );
    } else {
    return (
      <div className={parentClass}>
        {/* Overlay and POPUP */}
        {popup.show && (
          <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50" style={{ zIndex: 30 }}>
              <Popup message={popup.message} onClose={() => setPopup({ ...popup, show: false })} />
          </div>
        )}
        <label htmlFor={`label-${type}-${label}-${id}`} className="block text-sm font-bold text-primary dark:text-gray-400">{toTitleCase(label)}</label>
        <input 
          type={type} 
          id={id}
          key={key}
          className={"p-2 mt-2 mb-8 input input-bordered text-black dark:bg-gray-600 dark:text-gray-400 dark:border-gray-700 border rounded " + inputClass }
          value={inputValue}
          onBlur={handleStateChange} 
          onChange={handleLocalChange}
        />
      </div>
  )};
};

export default CardInput;

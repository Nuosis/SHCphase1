import React, { useState } from 'react';
import { Close, Delete } from '@mui/icons-material';
import { FaStar } from 'react-icons/fa'; // Import FontAwesome star icon
import Popup from '../UI Elements/Popup.js';

const icons = { Close, Delete };

const getValue = (state, path) => {
  try {
    const pathParts = path.match(/([^\.\[\]]+|\[\d+\])/g); 
    return pathParts.reduce((acc, part) => {
      const match = part.match(/\[(\d+)\]/);
      if (match) {
        return acc ? acc[parseInt(match[1])] : undefined;
      }
      return acc ? acc[part] : undefined;
    }, state);
  } catch (error) {
    console.error(`Error navigating state with key ${path}:`, error);
    return '';
  }
};

const CardInput = ({
  label,
  type = 'text',
  id,
  state,
  setState,
  stateKey,
  setEdited,
  value,
  placeholder,
  inputClass,
  parentClass
}) => {
  const [inputValue, setInputValue] = useState(value !== undefined ? value : getValue(state, stateKey));
  const [popup, setPopup] = useState({ show: false, message: '' });
  const [file, setFile] = useState(null);

  const handleStateChange = (newValue) => {
    const oldValue = getValue(state, stateKey);
    if (newValue !== oldValue) {
      const updatedState = { ...state };
      const keys = stateKey.split('.');
      let current = updatedState;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (key.includes('[') && key.includes(']')) {
          const index = parseInt(key.match(/\d+/)[0]);
          const arrayKey = key.split('[')[0];
          if (!current[arrayKey]) {
            current[arrayKey] = [];
          }
          if (!current[arrayKey][index]) {
            current[arrayKey][index] = {};
          }
          current = current[arrayKey][index];
        } else {
          if (!current[key]) {
            current[key] = {};
          }
          current = current[key];
        }
      }

      current[keys[keys.length - 1]] = newValue;
      setState(updatedState);

      const editInfo = {
        action: 'update',
        path: stateKey,
        value: newValue
      };
      setEdited(prevEdits => [...prevEdits, editInfo]);
    }
  };

  const handleStarClick = (rating) => {
    setInputValue(rating);
    handleStateChange(rating);
  };

  return (
    <div className={parentClass}>
      {popup.show && (
        <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50" style={{ zIndex: 30 }}>
          <Popup message={popup.message} onClose={() => setPopup({ ...popup, show: false })} />
        </div>
      )}
      {label && (
        <label htmlFor={`label-${type}-${label}-${id}`} className="block text-sm font-bold text-primary dark:text-gray-400">
          {label}
        </label>
      )}
      {type === 'star' ? (
        <div className="flex items-center text-2xl space-x-2 py-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              className={`cursor-pointer ${inputValue >= star ? 'text-yellow-500' : 'text-gray-300'}`}
              onClick={() => handleStarClick(star)}
            />
          ))}
        </div>
      ) : (
        <input
          type={type}
          id={`${type}-${label}-${id}`}
          className={`max-w-full mt-2 min-h-12 p-2 dark:bg-gray-600 text-black dark:text-gray-400 dark:border-gray-700 border rounded ${inputClass}`}
          value={inputValue}
          placeholder={placeholder}
          onBlur={(e) => handleStateChange(e.target.value)}
          onChange={(e) => setInputValue(e.target.value)}
        />
      )}
    </div>
  );
};

export default CardInput;
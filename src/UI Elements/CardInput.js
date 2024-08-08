import React, { useState } from 'react';
import { Close, Delete } from '@mui/icons-material';
import StarRating from '../UI Elements/StarRating.js';
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
}) => {
  const [inputValue, setInputValue] = useState(value !== undefined ? value : getValue(state, stateKey));
  const [popup, setPopup] = useState({ show: false, message: '' });
  const [file, setFile] = useState(null);

  const handleLocalChange = (e) => {
    let newValue = e.target.value;
    if (type === 'number') {
      newValue = e.target.value === '' ? '' : parseFloat(e.target.value);
    }
    setInputValue(newValue);
  };

  const handleStateChange = (e) => {
    let newValue = e && e.target && e.target.value !== undefined ? e.target.value : e;
    if (type === 'number') {
      newValue = newValue === '' ? '' : parseFloat(newValue);
    }
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
    } else {
      e.target.blur();
    }
  };

  const handleTelBlur = (e) => {
    const newValue = e.target.value;
    let digits = newValue.replace(/\D/g, '');
    if (digits.length !== 10) {
      setPopup({ show: true, message: "Telephone numbers must be 10 digits long: '(nnn) nnn-nnnn'" });
      return;
    }
    digits = `+${digits}`;
    const oldValue = getValue(state, stateKey);

    if (digits !== oldValue) {
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

      current[keys[keys.length - 1]] = digits;
      setState(updatedState);

      const editInfo = {
        action: "update",
        path: stateKey,
        value: digits
      };
      setEdited(prevEdits => [...prevEdits, editInfo]);
    } else {
      e.target.blur();
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result.split(',')[1];
      console.log('Base64 data:', base64data);
    };
    reader.readAsDataURL(selectedFile);
  };

  const camelCaseToTitleCase = (str) => {
    if (!str) return '';
    return str.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
  };

  function toTitleCase(str) {
    if (!str) return '';
    return str.replace(/\w\S*/g, function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

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
      <input
        type={type}
        id={`${type}-${label}-${id}`}
        className={`max-w-full mt-2 min-h-12 p-2 dark:bg-gray-600 text-black dark:text-gray-400 dark:border-gray-700 border rounded ${inputClass}`}
        value={inputValue}
        placeholder={placeholder}
        onBlur={handleStateChange}
        onChange={handleLocalChange}
      />
    </div>
  );
};

export default CardInput;
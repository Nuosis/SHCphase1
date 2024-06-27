import React from 'react';
import { Close } from '@mui/icons-material';
import StarRating from '../UI Elements/StarRating.js';

const icons = {Close};
const CardInput = (
  { 
    label, 
    type = 'text', 
    id, 
    childType, 
    state, 
    setState, 
    setEdited,
    stateKey,
    onSubmit,
    placeholder
  }
) => {

  const handleChange = (e) => {
    const updatedState = { ...state };
    const keys = stateKey.split('.');
    let current = updatedState;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = e.target.value;
    setState(updatedState);
    setEdited(true);
  };

  const handleChitDelete = (key, task) => {
    setEdited(`delete.${stateKey}.${key}.${task}`);
  };

  const camelCaseToTitleCase = (str) => {
    return str.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
  };

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
          value={stateKey.split('.').reduce((acc, key) => acc[key], state)}
          onChange={handleChange} 
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
          submitRating={onSubmit} />
      </div>
    );
  } else if(childType==="input"){
    return (
      <div className="">
        <label htmlFor={id} className="block text-gray-400 mb-2 font-medium">{label}</label>
        <input 
          type={type} 
          id={id} 
          className="max-w-full min-h-40 p-2 dark:bg-gray-600 dark:text-gray-400 dark:border-gray-700 border rounded" 
          value={stateKey.split('.').reduce((acc, key) => acc[key], state)}
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
          value={stateKey.split('.').reduce((acc, key) => acc[key], state)}
          onChange={handleChange} 
        />
      </div>
    );
  } else if(childType==="textarea"){
    return (
      <div className="">
        <label htmlFor={id} className="block text-gray-400 mb-2 font-medium">{label}</label>
        <input 
          id={id} 
          className="block p-2 border border-gray-200 rounded w-full"
          placeholder={placeholder}
          value={stateKey.split('.').reduce((acc, key) => acc[key], state)}
          onChange={handleChange} 
        />
      </div>
    );
  } else {
  return (
    <div className="">
      <label htmlFor={id} className="text-gray-400 mb-2 font-medium">{label}</label>
      <input 
        type={type} 
        id={id} 
        className="p-2 dark:bg-gray-600 dark:text-gray-400 dark:border-gray-700 border rounded" 
        value={stateKey.split('.').reduce((acc, key) => acc[key], state)}
        onChange={handleChange} 
      />
    </div>
  )};
};

export default CardInput;

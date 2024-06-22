import React from 'react';

const CardInput = ({ label, type = 'text', id, childType, state, setState, stateKey, setEdited }) => {
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
  if(childType==="chit"){
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
  } else {
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
  )};
};

export default CardInput;

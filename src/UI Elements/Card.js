import React, { useState } from 'react';
import { IconButton } from '../UI Elements/Button';
import { createRecord } from '../FileMaker/createRecord.js';
import { useAuth } from '../AuthContext.js';
import Popup from '../UI Elements/Popup.js';
import { useUser } from '../UserContext.js';

const RenderCreating = ({ id, type, setNewObj, newObj }) => {
  // Handle input changes to update newObj state
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewObj(prev => ({
      ...prev,
      [name]: value // Update newObj state based on input name
    }));
  };

  return (
    <div className="flex flex-row gap-2 ml-8 mr-4">
      <div className="form-control w-1/5">
        <label htmlFor={`label-${id}`} className="block text-sm font-bold text-primary dark:text-gray-400" >Label</label>
        <input 
          id={`label-${id}`} 
          name="label" // Name attribute is important for identifying the field in handleInputChange
          className="p-2 mt-2 input input-bordered text-black dark:bg-gray-600 dark:text-gray-400 dark:border-gray-700 border rounded" 
          value={newObj.label || ''} // Ensure value is never undefined
          onChange={handleInputChange}
          placeholder="Label..."
        />
      </div>
      <div className="form-control w-4/5">
        <label htmlFor={`field-${id}`} className="block text-sm font-bold text-primary dark:text-gray-400" >{type}</label>
        <input 
          id={`field-${id}`} 
          name="value" // Name attribute for this field
          className="p-2 mt-2 input input-bordered text-black dark:bg-gray-600 dark:text-gray-400 dark:border-gray-700 border rounded" 
          value={newObj.value || ''} // Ensure value is never undefined
          onChange={handleInputChange}
          placeholder={`New ${type}...`}
        />
      </div>
    </div>
  );
}

const Card = ({
  id,
  headerText,
  headerHiddenText,
  state,
  setState,
  setEdited,
  children,
  onSubmit,
  onNew,
  isOpen,
  onToggle,
  flex = "wrap"
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newObj, setNewObj] = useState({ label: "", value: "" });
  const { authState } = useAuth();
  const [popup, setPopup] = useState({ show: false, message: '' });
  const { getUserData } = useUser();

  const toggleCreating = () => {
    if (onNew) {
      setIsCreating(!isCreating);
    }
  };

  const handleNewSubmit = async () => {
    // Handle email and phone submissions as needed...
  };

  return (
    <div className="bg-white dark:bg-gray-700 shadow-lg rounded-lg max-w-screen-md w-full mb-6 overflow-hidden">
      {popup.show && (
        <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50" style={{ zIndex: 30 }}>
          <Popup message={popup.message} onClose={() => setPopup({ ...popup, show: false })} />
        </div>
      )}
      <h1
        className="text-2xl font-bold text-primary px-8 py-4 cursor-pointer dark:text-secondary"
        id={`accordion-collapse-heading-${id}`}
        data-accordion-target={`#accordion-collapse-body-${id}`}
        aria-controls={`#accordion-collapse-body-${id}`}
        onClick={onToggle}
      >
        {headerText}
        {!isOpen && (
          <span className="text-xs text-gray-400 font-normal float-right mt-2 hide-when-active">
            {Object.keys(headerHiddenText).map((key, index, array) => (
              <span key={key}>
                {key !== "Null" ? `${key}: ` : ''}{headerHiddenText[key]}{index < array.length - 1 ? ', ' : ''}
              </span>
            ))}
          </span>
        )}
      </h1>
      <form id={`accordion-collapse-body-${id}`} className={`px-8 pt-0 pb-8 ${isOpen ? '' : 'hidden'}`}>
        <div className={`flex flex-${flex}`}>
          {React.Children.map(children, (child) =>
            React.cloneElement(child)
          )}
        </div>
      </form>
      {isOpen && onNew && (
        <div className="flex mb-4 w-full">
          {isCreating ? (
            <>
              <div className="grow">
                <RenderCreating id={`new-${id}`} type={headerText} setNewObj={setNewObj} newObj={newObj} />
              </div>
              <IconButton
                icon="AddCircle"
                className="btn btn-primary self-end mr-8 mb-8 mt-7"
                type="button"
                onClick={handleNewSubmit}
                text="Submit"
              />
            </>
          ) : (
            <>
              <div className="grow" />
              <IconButton
                icon="AddCircle"
                className="btn btn-primary self-end mr-8 mb-8 mt-7"
                type="button"
                text="New"
                onClick={toggleCreating}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Card;
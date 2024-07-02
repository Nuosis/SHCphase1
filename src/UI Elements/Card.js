import React, { useState, useEffect } from 'react';
import { IconButton } from '../UI Elements/Button';
import { createRecord } from '../FileMaker/createRecord.js';
import { useAuth } from '../AuthContext.js';
import Popup from '../UI Elements/Popup.js'
import { useUser } from '../UserContext.js';

const RenderCreating = ({id, type, setNewObj, newObj}) => {
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
      <div class="form-control w-1/5">
        <label for={`label-${id}`} class="block text-sm font-bold text-primary dark:text-gray-400" >Label</label>
        <input 
          id={`label-${id}`} 
          name="label" // Name attribute is important for identifying the field in handleInputChange
          className="p-2 mt-2 input input-bordered text-black dark:bg-gray-600 dark:text-gray-400 dark:border-gray-700 border rounded" 
          value={newObj.label || ''} // Ensure value is never undefined
          onChange={handleInputChange}
          placeholder="Label..."
        />
      </div>
      <div class="form-control w-4/5">
      <label for={`field-${id}`} class="block text-sm font-bold text-primary dark:text-gray-400" >{type}</label>
        <input 
          id={`field-${id}`} 
          name="value" // Name attribute for this field
          className="p-2 mt-2 input input-bordered  text-black dark:bg-gray-600 dark:text-gray-400 dark:border-gray-700 border rounded" 
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
  rating,
  setRating,
  children,
  persistOpen,
  defaultOpen = false,
  flex = "wrap",
  onSubmit,
  onNew
}) => {
  // Initialize the state based on the persistOpen prop
  const [isOpen, setIsOpen] = useState(persistOpen !== undefined ? persistOpen : defaultOpen);
  const [isCreating, setIsCreating] = useState(false)
  const [newObj, setNewObj] = useState({label: "",value:""})
  const { authState } = useAuth();
  const [popup, setPopup] = useState({ show: false, message: '' });
  const { getUserData } = useUser();

  // Update isOpen state when persistOpen prop changes
  useEffect(() => {
    if (persistOpen !== undefined) {
      setIsOpen(persistOpen);
    }
  }, [persistOpen]);

  const toggleOpen = () => {
    if (persistOpen === undefined) {
      setIsOpen(!isOpen);
    }
  };

  const toggleCreating = () => {
    if (onNew) {
      setIsCreating(!isCreating);
    }
  };

  const handleNewSubmit = async () => {
    /**EMAIL */
    if(headerText==="Email" && newObj.value){ 
      let emailResult       
      try {
      const params = {
          fieldData: {
              email: newObj.value,
              label: newObj.label,
              f_primary: 0,
              "_fkID": state.userData.userInfo.metaData.ID,
          }
      };
      const layout = "dapiEmail"
      const emailReturn = false;
      emailResult = await createRecord(authState.token,params,layout, emailReturn);
      console.log("handleNewSubmit ...",{emailResult})
      } catch (error) {
        console.error(error)
        setPopup({ show: true, message: "Failed to create email. Please try again." }); //remove in production
        toggleCreating()
        setNewObj({label: "",value:""})
        return
      }
    }
    /**PHONE */
    else if (headerText==="Phone"){
      let phoneResult = {}
      try {
        const params = {
          fieldData: {
            phone: newObj.value,
            label: newObj.label,
            f_primary: 0,
            f_sms: 0,
            "_fkID": state.userData.userInfo.metaData.ID,
          }
        };
        const layout = "dapiPhone"
        const phoneReturn = false;
        phoneResult = await createRecord(authState.token,params,layout, phoneReturn);
        console.log(phoneResult)
      } catch (error) {
        toggleCreating()
        setNewObj({label: "",value:""})
        setPopup({ show: true, message: "Failed to create FileMaker Party account. Please try again." }); //remove in production
        return
      }
    }
    /* EXTEND TO NEW CREATION BLOCK HERE */
    toggleCreating()
    getUserData(state.userData.userInfo.metaData.ID)
    setNewObj({label: "",value:""})
  }

  return (
    <div className="bg-white dark:bg-gray-700 shadow-lg rounded-lg max-w-screen-md w-full mb-4 overflow-hidden">
      {/* Overlay and POPUP */}
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
        onClick={toggleOpen}
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
      <form id={`accordion-collapse-body-${id}`} className={`px-8 pt-4 pb-8 ${isOpen ? '' : 'hidden'}`}>
        <div className={`flex flex-${flex}`}>
          {React.Children.map(children, (child) =>
            React.cloneElement(child, { state, setState, setEdited, rating, setRating, onNew })
          )}
        </div>
      </form>
      {isOpen && onNew && (
        <div className="flex mb-4 w-full">
            {isCreating ? (
              <>
                <div className="grow">
                  <RenderCreating id={`new-${id}`} type={headerText} setNewObj={setNewObj} newObj={newObj}/>
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

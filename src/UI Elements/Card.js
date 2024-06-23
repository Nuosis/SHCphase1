import React, { useState, useEffect } from 'react';

const Card = (
    { 
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
      defaultOpen=false, 
      flex="wrap",
      onSubmit
    }
  ) => {
  // Initialize the state based on the persistOpen prop
  const [isOpen, setIsOpen] = useState(persistOpen !== undefined ? persistOpen : defaultOpen );

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


  return (
    <div className="bg-white dark:bg-gray-600 shadow-lg rounded-lg max-w-screen-md w-full mb-4 overflow-hidden">
      <h1 
        className="text-2xl font-bold text-brand-green px-8 py-4 cursor-pointer" 
        id={`accordion-collapse-heading-${id}`} 
        data-accordion-target={`#accordion-collapse-body-${id}`} 
        aria-controls={`#accordion-collapse-body-${id}`}
        onClick={toggleOpen}
      >
        {headerText}
        <span className="text-xs text-gray-400 font-normal float-right mt-2 hide-when-active">
          {Object.keys(headerHiddenText).map(key => (
            <span key={key}>{key}: {headerHiddenText[key]}, </span>
          ))}
        </span>
      </h1>
      <form id={`accordion-collapse-body-${id}`} className={`px-8 py-4 ${isOpen ? '' : 'hidden'}`}>
        <div className={`flex flex-${flex}`}>
          {React.Children.map(children, (child) =>
            React.cloneElement(child, { state, setState, setEdited, rating, setRating, onSubmit })
          )}
        </div>
      </form>
    </div>
  );
};

export default Card;

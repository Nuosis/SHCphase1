import React from 'react';

const Card = ({ headerText, headerHiddenText, state, setState, children }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg max-w-screen-md w-full mb-4 overflow-hidden">
      <h1 
        className="text-2xl font-bold text-brand-green px-8 py-4" 
        id="accordion-collapse-heading-1" 
        data-accordion-target="#accordion-collapse-body-1" 
        aria-controls="#accordion-collapse-body-1"
      >
        {headerText}
        <span className="text-xs text-gray-400 font-normal float-right mt-2 hide-when-active">
          {Object.keys(headerHiddenText).map(key => (
            <span key={key}>{key}: {headerHiddenText[key]}, </span>
          ))}
        </span>
      </h1>
      <form id="accordion-collapse-body-1" className="hidden px-8 py-4">
        <div className="flex flex-wrap">
          {React.Children.map(children, (child) =>
            React.cloneElement(child, { state, setState })
          )}
        </div>
        <button 
          className="text-white p-2 px-8 mt-8 rounded font-semibold bg-brand-green" 
          data-accordion-target="#accordion-collapse-body-2"
        >
          Next
        </button>
      </form>
    </div>
  );
};

export default Card;

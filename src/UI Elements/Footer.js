import React from 'react';

const Footer = ({ totalPrice, priceBreakdown, buttonText, buttonClickHandler }) => {
  return (
    <div className="p-8 md:py-8 md:px-0 max-w-screen-md w-full">
      <div id="footerComponents" className="flex justify-between">
        <div className="flex flex-col">
          {totalPrice && (
            <>
              <p className="text-lg font-semibold dark:text-gray-200">{totalPrice}</p>
              <p className="flex flex-col text-xs text-gray-400">
                {Array.isArray(priceBreakdown) && priceBreakdown.map((item, index) => (
                  <span key={index}>{item.description}: ${item.amount.toFixed(2)}{index < priceBreakdown.length - 1 ? ', ' : ''}</span>
                ))}
              </p>
            </>
          )}
        </div>
        {buttonText && (
          <div className="md:flex items-center space-x-1">
            <button type="button" className="w-full text-white dark:text-gray-300 p-2 px-8 rounded font-semibold bg-brand-green dark:bg-brand-green-dark" onClick={buttonClickHandler}>
              {buttonText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Footer;

import React from 'react';
import { IconButton } from '../UI Elements/Button';

const Footer = ({ totalPrice, priceBreakdown, buttonText, buttonClickHandler }) => {
  return (
    <div className="p-8 md:py-8 md:px-0 max-w-screen-md w-full">
      <div id="footerComponents" className="flex justify-between">
        <div className="flex flex-col">
          {totalPrice && (
            <>
              <p className="text-lg text-black font-semibold dark:text-gray-200">{totalPrice}</p>
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
             <IconButton
                    icon="CheckCircle"
                    className="btn btn-primary"
                    type="button"
                    text={buttonText}
                    onClick={buttonClickHandler}
                />
          </div>
        )}
      </div>
    </div>
  );
};

export default Footer;

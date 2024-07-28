import React from 'react';
import { IconButton } from '../UI Elements/Button';

const Footer = ({ priceBreakdown, buttonText, buttonClickHandler, icon }) => {
  // If we don;t have any button text, don't draw the footer
  if ( {buttonText}.buttonText === undefined || {buttonText}.buttonText === '' || {buttonText}.buttonText === null ){
    return;
  } else {
    const totalAmount = priceBreakdown.reduce((sum, item) => sum + item.amount, 0).toFixed(2);
    return (
      <div className="p-8 md:py-8 md:px-0 max-w-screen-md w-full">
        <div id="footerComponents" className="flex justify-between">
          <div className="flex flex-col">
            {totalAmount && (
              <>
                <p className="text-lg text-black font-semibold dark:text-gray-200">{`Total Price $${totalAmount}`}</p>
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
                      icon={icon}
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
  }
};

export default Footer;

import React from 'react';
import '../index.css';

const HeaderCard = ({ headerText, headerTextStyle, children }) => {
    return (
        <div className="bg-white dark:bg-gray-600 shadow-lg rounded-lg max-w-screen-md w-full mb-4 overflow-hidden">
            <div className="text-2xl font-bold text-brand-green px-8 py-4 cursor-pointer" style={headerTextStyle}>
                {headerText}
            </div>
            <div>
                {children}
            </div>
        </div>
    );
};

export default HeaderCard;


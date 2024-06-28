import React from 'react';
import '../index.css';

const HeaderCard = ({ headerText, headerTextStyle, children }) => {
    return (
        <div className="bg-white dark:bg-gray-700 shadow-lg rounded-lg max-w-screen-md w-full mb-4 overflow-hidden">
            <div className="text-2xl font-bold text-primary px-8 py-4 cursor-pointer dark:text-secondary" style={headerTextStyle}>
                {headerText}
            </div>
            <div class="px-8 py-4">
                {children}
            </div>
        </div>
    );
};

export default HeaderCard;
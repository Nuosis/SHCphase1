import React from 'react';
import '../index.css';

const HeaderCard = ({ headerText, headerTextStyle, children }) => {
    return (
        <div className="headerCard">
            <div className="headerCardHeader" style={headerTextStyle}>
                {headerText}
            </div>
            {children}
        </div>
    );
};

export default HeaderCard;


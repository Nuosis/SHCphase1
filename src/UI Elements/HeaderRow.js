import React from 'react';
import '../index.css';

const HeaderRow = ({ icon, onClick, text, textStyle }) => {
    return (
        <div className="headerRow" onClick={onClick} style={textStyle}>
            {icon && (
                <div className="headerRowIcon">
                    {icon}
                </div>
            )}
            <span className="headerRowText">{text}</span>
        </div>
    );
};

export default HeaderRow;

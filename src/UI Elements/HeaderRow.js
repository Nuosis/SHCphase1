import React from 'react';
import '../index.css';

const HeaderRow = ({ icon, onClick, text, textStyle, children}) => {
    return (
        <div className="headerRow" onClick={onClick} style={textStyle}>
            {icon && (
                <div className="headerRowIcon">
                    {icon}
                </div>
            )}
            <span className="headerRowText">{text}</span>
            {children && <div className="headerRowChildren">{children}</div>}
        </div>
    );
};

export default HeaderRow;

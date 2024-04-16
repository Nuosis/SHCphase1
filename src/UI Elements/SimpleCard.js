import React from 'react';
import '../index.css';

const SimpleCard = ({ icon, text, onIconClick, textStyle }) => {
    return (
        <div className="simpleCard">
            {icon && (
                <div className="cardIcon" onClick={onIconClick ? () => onIconClick() : null}>
                    <img src={icon} alt="Card Icon" />
                </div>
            )}
            <div className="cardText" style={textStyle}>
                {text}
            </div>
        </div>
    );
};

export default SimpleCard;

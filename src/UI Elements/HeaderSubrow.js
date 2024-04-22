import React from 'react';
import RadioButtonChecked from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUnchecked from '@mui/icons-material/RadioButtonUnchecked';
import '../index.css';

const HeaderSubrow = ({ key, onClick, isSelected, text }) => {
    return (
        <div className="headerRow" onClick={onClick} key={key}>
            <div className="headerRowIcon">
                {isSelected ? <RadioButtonChecked /> : <RadioButtonUnchecked />}
            </div>
            <span className="headerRowText">{text}</span>
        </div>
    );
};

export default HeaderSubrow;

import React from 'react';
import { HighlightOff, Delete, Info, Pets, Key, ChecklistRtl, RadioButtonChecked, Payment } from '@mui/icons-material';

const icons = {
    HighlightOff, Delete, Info, Pets, Key, ChecklistRtl, RadioButtonChecked, Payment
};

export const IconButton = ({ className, onClick, type, icon, text }) => {
    const IconComponent = icons[icon];

    return (
        <button className={className} onClick={onClick} type={type}>
            {icon && <IconComponent className="align-center items-center" />}
            {text && <span className="ml-2">{text}</span>}
        </button>
    );
};

export const TextButton = ({ className, onClick, type, text }) => {
    return (
        <button className={className} onClick={onClick} type={type}>
            {text}
        </button>
    );
};

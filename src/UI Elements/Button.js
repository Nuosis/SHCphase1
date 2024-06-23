import React from 'react';
import { HighlightOff, Delete, Info, Pets, Key, ChecklistRtl, RadioButtonChecked, Payment } from '@mui/icons-material';

const icons = {
    HighlightOff, Delete, Info, Pets, Key, ChecklistRtl, RadioButtonChecked, Payment
};

export const IconButton = ({ className="w-full text-white p-2 px-8 rounded dark:text-gray-300 font-semibold bg-brand-green dark:bg-brand-green-dark", onClick, type, icon, text }) => {
    const IconComponent = icons[icon];

    return (
        <button className={className} onClick={onClick} type={type}>
            {icon && <IconComponent className="align-center items-center" />}
            {text && <span className="ml-2">{text}</span>}
        </button>
    );
};

export const TextButton = ({ className="w-full text-white p-2 px-8 rounded-lg dark:text-gray-300 font-semibold bg-brand-green dark:bg-brand-green-dark", onClick, type, text }) => {
    return (
        <button className={className} onClick={onClick} type={type}>
            {text}
        </button>
    );
};

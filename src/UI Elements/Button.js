import React from 'react';
import {
    Group, HighlightOff, Delete, Info, Pets, Key, ChecklistRtl, RadioButtonChecked, Payment, AddCircle, Edit, InsertDriveFile, CreditCard, CheckCircle, DeleteForever, Send, Person, Business, AccountCircle, Help, FileDownload
} from '@mui/icons-material';

// If the imported icons are not directly referenced the package build complains
const icons = {
  Group, HighlightOff, Delete, Info, Pets, Key, ChecklistRtl, RadioButtonChecked, Payment, AddCircle, Edit, InsertDriveFile, CreditCard, CheckCircle, DeleteForever, Send, Person, Business, AccountCircle, Help, FileDownload
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

export const TextButton = ({ className="w-full btn btn-primary", onClick, type, text }) => {
    return (
        <button className={className} onClick={onClick} type={type}>
            {text}
        </button>
    );
};

export const TextButtonSecondary = ({ className="btn btn-outline dark:btn-outline dark:text-gray-500", onClick, type, text }) => {
    return (
        <button className={className} onClick={onClick} type={type}>
            {text}
        </button>
    );
};

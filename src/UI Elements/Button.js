import React from 'react';
import {
    Group, HighlightOff, Delete, Info, Pets, Key, ChecklistRtl, RadioButtonChecked, Payment, AddCircle, Edit, InsertDriveFile, CreditCard, CheckCircle, DeleteForever, Send, Person, Business, AccountCircle, Help, FileDownload
} from '@mui/icons-material';

// If the imported icons are not directly referenced the pachage builde compplains
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

export const RoundButton = ({ onClick, name, image }) => {
  // console.log({name})
  const getInitials = (name) => {
      return name.split(' ')
                 .slice(0, 2) // Take only the first two names (if applicable)
                 .map((n) => n[0]) // Get the first letter of each part
                 .join(''); // Join them together
  };

  return (
      <button 
          onClick={onClick} 
          className="flex justify-center items-center bg-primary hover:bg-secondary text-white font-bold p-0 rounded-full w-8 h-8"
      >
          {image ? (
              <img
                  src={image}
                  className="rounded-full"
                  style={{ height: "32px", width: "32px" }}
                  alt=""
                  loading="lazy"
              />
          ) : name === "multiMember" ? (
            <Group className="text-xl text-primary" />
          ) : (
            <span className="text-sm p-1">{getInitials(name)}</span>
          )}
      </button>
  );
};

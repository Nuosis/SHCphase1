import React from 'react';

const ButtonContainer = ({ children }) => {
    return (
        <div className="flex gap-4 items-end">
            {React.Children.map(children, child => (
                child
            ))}
        </div>
    );
};

export default ButtonContainer;

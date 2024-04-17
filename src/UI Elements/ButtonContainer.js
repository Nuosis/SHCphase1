import React from 'react';

const ButtonContainer = ({ children }) => {
    return (
        <div className="flex gap-2">
            {React.Children.map(children, child => (
                <div>
                    {child}
                </div>
            ))}
        </div>
    );
};

export default ButtonContainer;

import React, { useState } from 'react';
import HeaderCard from './HeaderCard'; // Import the HeaderCard component
import 'daisyui'; // Ensure DaisyUI is imported if it is not globally available

const AccessCard = ({ onSubmitAccess }) => {
    const [accessInstructions, setAccessInstructions] = useState('');

    const headerTextStyle = {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '24px'
    };

    const handleAccessSubmit = (e) => {
        e.preventDefault();
        onSubmitAccess(accessInstructions); // This function should be defined in the parent component or context
    };

    return (
        <HeaderCard headerText="Access" headerTextStyle={headerTextStyle}>
            <form onSubmit={handleAccessSubmit} className="flex flex-col gap-4 p-4">
                <textarea 
                    className="textarea textarea-bordered w-full" 
                    placeholder="Type your access instructions here..."
                    value={accessInstructions}
                    onChange={(e) => setAccessInstructions(e.target.value)}
                />
                <button type="submit" className="btn btn-primary">
                    Update
                </button>
            </form>
        </HeaderCard>
    );
    };

    export default AccessCard;

import React, { useState } from 'react';
import HeaderCard from '../UI Elements/HeaderCard';
import {IconButton} from '../UI Elements/Button';
import 'daisyui'; // Ensure DaisyUI is imported if it is not globally available

const GeneralInstructions = ({ onSubmitGenInstruct }) => {
    const [generalInstructions, setGeneralInstructions] = useState('');

    const headerTextStyle = {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '24px'
    };

    const handleAccessSubmit = (e) => {
        e.preventDefault();
        onSubmitGenInstruct(generalInstructions); // This function should be defined in the parent component or context
    };

    return (
        <HeaderCard headerText="General Instructions" headerTextStyle={headerTextStyle}>
            <form onSubmit={handleAccessSubmit} className="flex flex-col justify-end gap-4 p-4 min-h-96">
                <textarea 
                    className="textarea textarea-bordered w-full flex-grow overflow-y-auto" 
                    placeholder="Type any additional instructions here. These will be sent to the cleaner for every clean. Your preferences, (scent, areas of focus, etc) are really helpful here."
                    value={generalInstructions}
                    onChange={(e) => setGeneralInstructions(e.target.value)}
                />
                <IconButton
                    className="btn btn-primary"
                    type="submit"
                    text="Update"
                />
            </form>
        </HeaderCard>
    );
};

export default GeneralInstructions;

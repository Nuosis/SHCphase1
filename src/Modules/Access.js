import React, { useState } from 'react';
import HeaderCard from '../UI Elements/HeaderCard';
import { TextButton, IconButton } from '../UI Elements/Button';
import 'daisyui';

const AccessCard = ({json, onSubmitAccess}) => {
    // Convert the initial JSON data to a usable state format
    const parsedJson = json.map((entry) => ({
        ...JSON.parse(entry.data),
        id: entry.ID,
        dapiRecordID: entry.dapiRecordID
    }));
    //console.log('General Instructions Called: ',{parsedJson})
    const [accessInstructions, setAccessInstructions] = useState(parsedJson[0].details);

    const headerTextStyle = {

    };

    const handleAccessSubmit = (e) => {
        e.preventDefault();
        onSubmitAccess(accessInstructions);
    };

    return (
        <div className="flex-grow items-stretch justify-center flex-grow">
            <div className="flex flex-col items-center justify-center flex-grow">
                <HeaderCard headerText="Access" headerTextStyle={headerTextStyle}>
                    <form onSubmit={handleAccessSubmit} className="flex flex-col justify-end min-h-96">
                        <textarea 
                            className="textarea text-black textarea-bordered dark:bg-gray-600 dark:text-gray-400 dark:border-gray-700 w-full flex-grow overflow-y-auto" 
                            placeholder="Type your access instructions here..."
                            value={accessInstructions}
                            onChange={(e) => setAccessInstructions(e.target.value)}
                        />
                        <IconButton
                            icon="CheckCircle"
                            className="btn btn-primary my-4"
                            type="submit"
                            text="Update"
                        />
                    </form>
                </HeaderCard>
            </div>\
        </div>
    );
};

export default AccessCard;

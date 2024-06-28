import React, { useState } from 'react';
import HeaderCard from '../UI Elements/HeaderCard';
import { IconButton } from '../UI Elements/Button';
import 'daisyui'; // Ensure DaisyUI is imported if it is not globally available

const GeneralInstructions = ({json, onSubmitGenInstruct}) => {
    // Convert the initial JSON data to a usable state format
    const parsedJson = json.map((entry) => ({
        ...JSON.parse(entry.data),
        id: entry.ID,
        dapiRecordID: entry.dapiRecordID
    }));
    //console.log('General Instructions Called: ',{parsedJson})

    const [generalInstructions, setGeneralInstructions] = useState(parsedJson[0].details);

    const headerTextStyle = {

    };

    const handleAccessSubmit = (e) => {
        e.preventDefault();
        onSubmitGenInstruct(generalInstructions); // This function should be defined in the parent component or context
    };

    return (
      <div className="flex flex-col items-center justify-center flex-grow">
        <HeaderCard headerText="General Instructions" headerTextStyle={headerTextStyle}>
            <form onSubmit={handleAccessSubmit} className="flex flex-col justify-end gap-4 min-h-96 mb-4">
                <textarea 
                    className="textarea text-black textarea-bordered w-full flex-grow overflow-y-auto dark:bg-gray-600 dark:text-gray-400 dark:border-gray-700 " 
                    placeholder="Type any additional instructions here. These will be sent to the cleaner for every clean. Your preferences, (scent, areas of focus, etc) are really helpful here."
                    value={generalInstructions}
                    onChange={(e) => setGeneralInstructions(e.target.value)}
                />
                <IconButton
                    icon="CheckCircle"
                    className="btn btn-primary"
                    type="submit"
                    text="Update"
                />
            </form>
        </HeaderCard>
      </div>
    );
};

export default GeneralInstructions;

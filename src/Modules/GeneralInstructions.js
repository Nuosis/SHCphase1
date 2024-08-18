import React, { useState } from 'react';
import HeaderCard from '../UI Elements/HeaderCard';
import { IconButton } from '../UI Elements/Button';
import 'daisyui'; // Ensure DaisyUI is imported if it is not globally available

//TODO: update not working

const GeneralInstructions = ({ json, onSubmitGenInstruct }) => {
  let initialInstructions = "";
  try {
      const parsedJson = json.map((entry) => ({
          ...JSON.parse(entry.data),
          id: entry.ID,
          dapiRecordID: entry.dapiRecordID
      }));
      if (parsedJson.length > 0) {
          initialInstructions = parsedJson[0].details || ""; // Ensure a string even if undefined
      }
      console.log('General Instructions Called:', {parsedJson});
  } catch (error) {
      console.error('Failed to parse JSON:', error);
      // Optionally, set an error state here to show an error message in the UI
  }

  const [generalInstructions, setGeneralInstructions] = useState(initialInstructions);

  const handleAccessSubmit = (e) => {
      e.preventDefault();
      onSubmitGenInstruct(generalInstructions); // This function should be defined in the parent component or context
  };

  return (
      <div className="items-stretch justify-center flex-grow">
          <div className="flex flex-col items-center justify-center flex-grow">
              <HeaderCard headerText="General Instructions">
                  <form onSubmit={handleAccessSubmit} className="flex flex-col justify-end gap-4 min-h-96 mb-4">
                      <textarea 
                          className="textarea text-black textarea-bordered w-full flex-grow overflow-y-auto dark:bg-gray-600 dark:text-gray-400 dark:border-gray-700 " 
                          placeholder="Type any additional instructions here..."
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
      </div>
  );
};

export default GeneralInstructions;

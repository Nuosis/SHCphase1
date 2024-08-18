import React, { useState } from 'react';
import HeaderCard from '../UI Elements/HeaderCard';
import { /*TextButton,*/ IconButton } from '../UI Elements/Button';
import 'daisyui';

//TODO: update not working

const AccessCard = ({ json, onSubmitAccess }) => {
  let initialAccessInstructions = "";
  try {
      const parsedJson = json.map((entry) => ({
          ...JSON.parse(entry.data),
          id: entry.ID,
          dapiRecordID: entry.dapiRecordID
      }));
      if (parsedJson.length > 0) {
          initialAccessInstructions = parsedJson[0].details || ""; // Ensure a string even if undefined
      }
      console.log('Access Instructions Called:', {parsedJson});
  } catch (error) {
      console.error('Failed to parse JSON:', error);
      // Optionally, set an error state here to show an error message in the UI
  }

  const [accessInstructions, setAccessInstructions] = useState(initialAccessInstructions);

  const handleAccessSubmit = (e) => {
      e.preventDefault();
      onSubmitAccess(accessInstructions);
  };

  return (
      <div className="flex-grow items-stretch justify-center flex-grow">
          <div className="flex flex-col items-center justify-center flex-grow">
              <HeaderCard headerText="Access">
                  <form onSubmit={handleAccessSubmit} className="flex flex-col justify-end gap-4 min-h-96">
                      <textarea 
                          className="textarea text-black textarea-bordered w-full flex-grow overflow-y-auto dark:bg-gray-600 dark:text-gray-400 dark:border-gray-700" 
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
          </div>
      </div>
  );
};

export default AccessCard;

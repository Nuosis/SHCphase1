import React, { useState } from 'react';
import { useAuth } from '../AuthContext.js';
import { Close, Delete } from '@mui/icons-material';
import StarRating from '../UI Elements/StarRating.js';
import Popup from '../UI Elements/Popup.js'
import { useUser } from '../UserContext.js';
import { deleteRecord } from '../FileMaker/deleteRecord.js'
import { readRecord } from '../FileMaker/readRecord.js'

const icons = {Close, Delete};
const getValue = (state, path) => {
  // console.log('Initial State:', state);
  try {
      // eslint-disable-next-line no-useless-escape
      const pathParts = path.match(/([^\.\[\]]+|\[\d+\])/g); // This regex matches property names and array indices
      return pathParts.reduce((acc, part) => {
          const match = part.match(/\[(\d+)\]/); // Check if the part is an array index
          if (match) {
              return acc ? acc[parseInt(match[1])] : undefined; // Access the array index
          }
          return acc ? acc[part] : undefined; // Access the property
      }, state);
  } catch (error) {
      console.error(`Error navigating state with key ${path}:`, error);
      return ''; // Return a default/fallback value
  }
}
const CardDelete = (
  { 
    label, 
    type = 'text', 
    id, 
    childType, 
    state, 
    setState, 
    stateKey,
    setEdited,
    onNew,
    value,
    placeholder
  }
) => {

  const [popup, setPopup] = useState({ show: false, message: '' });
  const { authState } = useAuth();
  const { getUserData } = useUser();

  const handleDeleteEvent = async () => {
    try {
      const pathParts = stateKey.split('.');
      const key = pathParts.pop(); // Gets the last element
      const metaDataPath = [...pathParts, "metaData"].join('.');
      const metaData = getValue(state, metaDataPath);
      const table = metaData[key]?.table || metaData.table;
      let recordID = metaData[key]?.recordID || metaData.recordID;
      const UUID = metaData[key]?.ID || metaData.ID;
      console.log({key},{metaData},{table},{recordID},{UUID})

      if (!recordID && !UUID) {
        setPopup({ show: true, message: "There was an issue in the way the data is stored and retrieved. Delete unsuccessfull" });
        return
      } else if (!recordID) {
        const params = [{"_partyID": UUID}];
        const layout = table;
        const data = await readRecord(authState.token, params, layout);
        if (data.length === 0) throw new Error("Error getting recordID from FileMaker");
        recordID = data.response.recordId;
      }
      const layout = table;
      const data = await deleteRecord(authState.token, layout, recordID);
      if (data.messages && data.messages[0].code !== "0") {
        throw new Error(`Failed to delete record: ${data.messages[0].message}`);
      }
    } catch (error) {
      console.error(`Error processing delete:`, error);
    }

    const userID = state.userData.userInfo.metaData.ID
    getUserData(userID)
  };

  return (
    <div className="mt-8">
       <a className="btn dark:btn-outline dark:text-gray-500 btn-sm ml-4" onClick={handleDeleteEvent}>
          <Delete/>
        </a>
    </div>
)
};

export default CardDelete;

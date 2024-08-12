import React, { createContext, useContext, useState } from 'react';
import { getPartyData } from './contextFunctions/GetPartyData.js';

const CleanerContext = createContext();

export const useCleaner = () => useContext(CleanerContext);

export const CleanerProvider = ({ children }) => {
    const [cleanerData, setCleanerData] = useState({});
    const getCleanerData = async (filemakerId,authState) => {
      console.log("Getting cleaner data ...");
      try {
          const cleanerData = await getPartyData(filemakerId,authState);
          setCleanerData(cleanerData);
          return { success: true, cleanerData };
      } catch (error) {
          console.error('Error fetching cleaner data:', error);
          return { success: false, error };
      }
  };
  

    return (
        <CleanerContext.Provider value={{ cleanerData, setCleanerData, getCleanerData }}>
            {children}
        </CleanerContext.Provider>
    );
}
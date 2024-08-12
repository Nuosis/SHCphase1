import React, { createContext, useContext, useState } from 'react';
import { getOrg } from './contextFunctions/GetOrgData.js';

const OrgContext = createContext();

export const useOrg = () => useContext(OrgContext);

export const OrgProvider = ({ children }) => {
    const [orgData, setOrgData] = useState({});
    const getOrgData = async (orgId,authState) => {
      try {
          const orgData = await getOrg(orgId,authState);
          setOrgData(orgData.orgData);
          return { success: true, orgData };
      } catch (error) {
          console.error('Error fetching org data:', error);
          return { success: false, error };
      }
  };
  

    return (
        <OrgContext.Provider value={{ orgData, setOrgData, getOrgData }}>
            {children}
        </OrgContext.Provider>
    );
}
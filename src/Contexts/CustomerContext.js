import React, { createContext, useContext, useState } from 'react';
import { getPartyData } from './contextFunctions/GetPartyData.js';

const CustomerContext = createContext();

export const useCustomer = () => useContext(CustomerContext);

export const CustomerProvider = ({ children }) => {
    const [customerData, setCustomerData] = useState({});
    const getCustomerData = async (filemakerId,authState) => {
      console.log("Getting customer data ...");
      try {
          const customerData = await getPartyData(filemakerId,authState);
          setCustomerData(customerData);
          return { success: true, customerData };
      } catch (error) {
          console.error('Error fetching customer data:', error);
          return { success: false, error };
      }
  };
  

    return (
        <CustomerContext.Provider value={{ customerData, setCustomerData, getCustomerData }}>
            {children}
        </CustomerContext.Provider>
    );
}
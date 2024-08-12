import React, { createContext, useContext, useState } from 'react';
import { getPartyData } from './contextFunctions/GetPartyData.js';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [userData, setUserData] = useState({});

    const getUserData = async (filemakerId,authState) => {
        console.log("Getting user data ...")
        try{
          const userData = await getPartyData(filemakerId,authState)
          // console.log(userData)
          const partyData = userData.partyData
          setUserData(partyData);
          return {success: true,partyData};
        } catch (error) {
          return {success: false,error};
        }
    }
    return (
        <UserContext.Provider value={{ userData, setUserData, getUserData }}>
            {children}
        </UserContext.Provider>
    );
}
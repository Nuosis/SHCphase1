import React, { createContext, useContext, useState } from 'react';
import { readRecord } from './FileMaker/readRecord.js';
import { useAuth } from './AuthContext.js';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [userData, setUserData] = useState({});
    const { authState, setAuthState } = useAuth();

    function createAddressObject(userObject) {
        // Initialize an empty object to store the addresses
        const addressObject = {};

        // Map over the array of addresses
        userObject[0].portalData.dapiPartyAddress.forEach(address => {
        // Extract address details
        const { type, 
            streetAddress = address["dapiPartyAddress::streetAddress"], 
            unitNumber = address["dapiPartyAddress::unitNumber"], 
            city = address["dapiPartyAddress::city"], 
            prov = address["dapiPartyAddress::prov"], 
            postalCode = address["dapiPartyAddress::postalCode"], 
            country = address["dapiPartyAddress::country"], 
            ID = address["dapiPartyAddress::__ID"],
            dapiRecordID=address['dapiPartyAddress::~dapiRecordID'] 
        } = address;

        // Create an object for the address
        const addressDetails = {
            ID,
            dapiRecordID,
            street: streetAddress,
            unit: unitNumber,
            city,
            province: prov,
            postalCode,
            country
        };

        // Create a key using the address type and assign the address details
        addressObject[type] = addressDetails;
    })};

    function createEmailObject(userObject) {
        const newObject = {};
        userObject[0].portalData.dapiPartyEmail.forEach(record => {
        const { 
            label = record["dapiPartyEmail::label"], 
            email  = record["dapiPartyEmail::email"], 
            primary = record["dapiPartyEmail::f_primary"],
            dapiRecordID = record["dapiPartyEmail::~dapiRecordID"], 
            ID = record["dapiPartyEmail::__ID"]
        } = record;
        const details = {
            email,
            ID,
            dapiRecordID,
            primary,
        };
        newObject[label] = details;
    })};

    function createDetailsObject(userObject) {
        const newObject = {};
        userObject[0].portalData.dapiPartyDetails.forEach(record => {
        const { 
            type = record["dapiPartyDetails::type"],
            data = record["dapiPartyDetails::data"],
            dapiRecordID = record["dapiPartyDetails::~dapiRecordID"], 
            ID = record["dapiPartyDetails::__ID"]
        } = record;
        const details = {
            data,
            ID,
            dapiRecordID,
        };
        newObject[type] = details;
    })};

    const getUserData = async (filemakerId) => {
        //GET USER OBJECT RECORD
        const layout = "dapiPartyObject"
        const query = [
            {"__ID": filemakerId}
        ];
        const filemakerUserObject = await readRecord(authState.token,{query},layout)
        if(filemakerUserObject.length===0){
            throw new Error("Error on getting user info from FileMaker")
        }
        const userObject = filemakerUserObject.response.data    
        const userInfo = {
            displayName: userObject[0].fieldData.displayName,
            firstName: userObject[0].fieldData.firstName,
            lastName: userObject[0].fieldData.lastName,
            dapiRecordID: userObject[0].fieldData["~dapiRecordID"],
            ID: userObject[0].fieldData["__ID"],
        }
        const userAddress = createAddressObject(userObject)
        const userEmail = createEmailObject(userObject)
        const userDetails = createDetailsObject(userObject)

        setUserData({userInfo,userDetails,userAddress,userEmail});

    }

    return (
        <UserContext.Provider value={{ userData, setUserData, getUserData }}>
            {children}
        </UserContext.Provider>
    );
}
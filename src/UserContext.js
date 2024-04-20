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
            const { 
                type = address["dapiPartyAddress::type"] || 'home',
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

            if (addressObject[type]) {
                addressObject[type].push(addressDetails);
            } else {
                addressObject[type] = [addressDetails];
            }
        })
        return addressObject
    };

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

            if (newObject[label]) {
                newObject[label].push(details);
            } else {
                newObject[label] = [details];
            }
        })
        return newObject
    };

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

            if (newObject[type]) {
                newObject[type].push(details);
            } else {
                newObject[type] = [details];
            }
        })
        return newObject
    };

    function createMessagesObject(userObject) {
        const newObject = {};
        userObject[0].portalData.dapiPartyMessage.forEach(record => {
            const { 
                type = record["dapiPartyMessage::type"],
                message = record["dapiPartyMessage::message"],
                status = record["dapiPartyMessage::status"],
                dapiRecordID = record["dapiPartyMessage::~dapiRecordID"], 
                ID = record["dapiPartyMessage::__ID"]
            } = record;
            const details = {
                message,
                status,
                ID,
                dapiRecordID,
            };

            if (newObject[type]) {
                newObject[type].push(details);
            } else {
                newObject[type] = [details];
            }
        })
        return newObject
    };

    function createPhonesObject(userObject) {
        const newObject = {};
        userObject[0].portalData.dapiPartyPhone.forEach(record => {
            const { 
                label = record["dapiPartyPhone::label"],
                phone = record["dapiPartyPhone::phone"],
                primary = record["dapiPartyPhone::f_primary"],
                sms = record["dapiPartyPhone::f_sms"],
                dapiRecordID = record["dapiPartyPhone::~dapiRecordID"], 
                ID = record["dapiPartyPhone::__ID"]
            } = record;
            const details = {
                phone,
                primary,
                sms,
                ID,
                dapiRecordID,
            };

            if (newObject[label]) {
                newObject[label].push(details);
            } else {
                newObject[label] = [details];
            }
        })
        return newObject
    };

    function createBillableObject(userObject) {
        const newObject = {};
        userObject[0].portalData.dapiPartyBillable.forEach(record => {
            const { 
                description = record["dapiPartyBillable::description"],
                taxableGST = record["dapiPartyBillable::f_taxableGST"],
                taxableHST = record["dapiPartyBillable::f_taxableHST"],
                taxablePST = record["dapiPartyBillable::f_taxablePST"],
                gstAmount = record["dapiPartyBillable::gstAmount"],
                hstAmount = record["dapiPartyBillable::hstAmount"],
                pstAmount = record["dapiPartyBillable::pstAmount"],
                quantity = record["dapiPartyBillable::quantity"],
                unitPrice = record["dapiPartyBillable::unitPrice"],
                price = record["dapiPartyBillable::price"],
                unit = record["dapiPartyBillable::unit"],
                dapiRecordID = record["dapiPartyBillable::~dapiRecordID"], 
                ID = record["dapiPartyBillable::__ID"]
            } = record;
            const details = {
                price,
                quantity,
                unitPrice,
                taxableGST,
                taxableHST,
                taxablePST,
                gstAmount,
                hstAmount,
                pstAmount,
                unit,
                ID,
                dapiRecordID,
            };
            newObject[description] = details;

            if (newObject[description]) {
                newObject[description].push(details);
            } else {
                newObject[description] = [details];
            }
        })
        return newObject
    };

    function createRelatedObject(userObject) {
        const newObject = {};
        userObject[0].portalData.relatedParties.forEach(record => {
            const { 
                type = record["dapiPartyRelatedParties_partyID::type"],
                partyID = record["dapiPartyRelatedParties_partyID::_partyID"],
                relatedPartyID = record["dapiPartyBillable::_partyID"],
                dapiRecordID = record["dapiPartyRelatedParties_partyID::~dapiRecordID"], 
                ID = record["dapiPartyRelatedParties_partyID::__ID"]
            } = record;
            const details = {
                partyID,
                relatedPartyID,
                ID,
                dapiRecordID,
            };

            if (newObject[type]) {
                newObject[type].push(details);
            } else {
                newObject[type] = [details];
            }
        })
        return newObject
    };

    const getUserData = async (filemakerId) => {
        console.log("Getting user data ...")
        
        
        //GET USER OBJECT RECORD
        const userLayout = "dapiPartyObject"
        const userQuery = [
            {"__ID": filemakerId}
        ];

        const billableLayout = "dapiBillableObject"
        const billableQuery = [
            {"_partyID": filemakerId}
        ];
        
        try{
            const filemakerUserObject = await readRecord(authState.token,{userQuery},userLayout)
            if(filemakerUserObject.length===0){
                throw new Error("Error on getting user info from FileMaker")
            }
            console.log("fetch successfull ...")
            const userObject = filemakerUserObject.response.data  
            //console.log({userObject}) 

            const filemakerBillableObject = await readRecord(authState.token,{billableQuery},billableLayout)
            if(filemakerBillableObject.length===0){
                throw new Error("Error on getting billable info from FileMaker")
            }
            console.log("fetch successfull ...")
            const billableObject = filemakerBillableObject.response.data  
            //console.log({userObject}) 

            const userInfo = {
                displayName: userObject[0].fieldData.displayName,
                firstName: userObject[0].fieldData.firstName,
                lastName: userObject[0].fieldData.lastName,
                dapiRecordID: userObject[0].fieldData["~dapiRecordID"],
                ID: userObject[0].fieldData["__ID"],
                orgID: userObject[0].fieldData["_orgID"],
            }
            //console.log({userInfo})

            const orgLayout = "dapiOrganizationObject"
            const orgQuery = [
                {"__ID": userInfo.orgID}
            ];

            const filemakerOrgObject = await readRecord(authState.token,{orgQuery},orgLayout)
            if(filemakerOrgObject.length===0){
                throw new Error("Error on getting organization info from FileMaker")
            }
            console.log("fetch successfull ...")
            const orgObject = filemakerOrgObject.response.data  
            //console.log({userObject}) 

            const userAddress = createAddressObject(userObject)
            //console.log({userAddress})
            if(!userAddress){throw new Error("Address Object undefined");}
            const userEmail = createEmailObject(userObject)
            //console.log({userEmail})
            const userDetails = createDetailsObject(userObject)
            //console.log({userDetails})
            const userMessages = createMessagesObject(userObject)
            //console.log({userMessages})
            const userPhones = createPhonesObject(userObject)
            //console.log({userPhones})
            const userBillables = createBillableObject(userObject)
            //console.log({userBillables})
            const userRelated = createRelatedObject(userObject)

            //COMPANY INFO
            //sellableItems
            //gstNumber
            //wcbNumber
            //contactInfo

            //PURCHASE HX
            //wo 
            //outcome
            //picture (before/after)

            setUserData({userInfo,userDetails,userAddress,userEmail,userMessages,userPhones,userBillables,userRelated});
            return true;
        } catch (error) {
            console.error('Getting User Data Error:', error);
            setAuthState(prevState => ({
                ...prevState,
                errorMessage: error.message,
            }));
            return false;
        }

    }

    return (
        <UserContext.Provider value={{ userData, setUserData, getUserData }}>
            {children}
        </UserContext.Provider>
    );
}
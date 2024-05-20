import React, { createContext, useContext, useState } from 'react';
import { readRecord } from './FileMaker/readRecord.js';
import { useAuth } from './AuthContext.js';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [userData, setUserData] = useState({});
    const { authState, setAuthState } = useAuth();

    function createAddressObject(userObject, portalStem) {
        // Initialize an empty object to store the addresses
        const addressObject = {};        
        if (Array.isArray(userObject[0]?.portalData?.[portalStem])) {
        userObject[0].portalData[portalStem].forEach(address => {
            // Extract address details
            const { 
                type = address[`${portalStem}::type`] || 'home',
                streetAddress = address[`${portalStem}::streetAddress`], 
                unitNumber = address[`${portalStem}::unitNumber`], 
                city = address[`${portalStem}::city`], 
                prov = address[`${portalStem}::prov`], 
                postalCode = address[`${portalStem}::postalCode`], 
                country = address[`${portalStem}::country`], 
                ID = address[`${portalStem}::__ID`],
                dapiRecordID=address[`${portalStem}::~dapiRecordID`] 
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
        })}
        return addressObject
    };

    function createEmailObject(userObject, portalStem) {
        const newObject = {};
        if (Array.isArray(userObject[0]?.portalData?.[portalStem])) {
        userObject[0].portalData[portalStem].forEach(record => {
            const { 
                label = record[`${portalStem}::label`], 
                email  = record[`${portalStem}::email`], 
                primary = record[`${portalStem}::f_primary`],
                dapiRecordID = record[`${portalStem}::~dapiRecordID`], 
                ID = record[`${portalStem}::__ID`]
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
        })}
        return newObject
    };

    function createDetailsObject(userObject, portalStem) {
        const newObject = {};
        if (Array.isArray(userObject[0]?.portalData?.[portalStem])) {
        userObject[0].portalData[portalStem].forEach(record => {
            const { 
                type = record[`${portalStem}::type`],
                data = record[`${portalStem}::data`],
                dapiRecordID = record[`${portalStem}::~dapiRecordID`], 
                ID = record[`${portalStem}::__ID`]
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
        })}
        return newObject
    };

    // function createMessagesObject(userObject, portalStem) {
    //     const newObject = {};
    //     userObject[0].portalData[portalStem].forEach(record => {
    //         const { 
    //             type = record[`${portalStem}::type`],
    //             message = record[`${portalStem}::message`],
    //             status = record[`${portalStem}::status`],
    //             dapiRecordID = record[`${portalStem}::~dapiRecordID`], 
    //             ID = record[`${portalStem}::__ID`]
    //         } = record;
    //         const details = {
    //             message,
    //             status,
    //             ID,
    //             dapiRecordID,
    //         };

    //         if (newObject[type]) {
    //             newObject[type].push(details);
    //         } else {
    //             newObject[type] = [details];
    //         }
    //     })
    //     return newObject
    // };

    function createPhonesObject(userObject, portalStem) {
        const newObject = {};
        if (Array.isArray(userObject[0]?.portalData?.[portalStem])) {
        userObject[0].portalData[portalStem].forEach(record => {
            const { 
                label = record[`${portalStem}::label`],
                phone = record[`${portalStem}::phone`],
                primary = record[`${portalStem}::f_primary`],
                sms = record[`${portalStem}::f_sms`],
                dapiRecordID = record[`${portalStem}::~dapiRecordID`], 
                ID = record[`${portalStem}::__ID`]
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
        })}
        return newObject
    };

    function createRelatedObject(userObject, portalStem) {
        const newObject = {};
        if (Array.isArray(userObject[0]?.portalData?.[portalStem])) {
        userObject[0].portalData[portalStem].forEach(record => {
            const { 
                type = record[`${portalStem}::type`],
                partyID = record[`${portalStem}::_partyID`],
                relatedPartyID = record[`${portalStem}::_relatedPartyID`],
                dapiRecordID = record[`${portalStem}::~dapiRecordID`], 
                ID = record[`${portalStem}::__ID`]
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
        })}
        return newObject
    };

    function createSellableObject(userObject, portalStem) {
        const newObject = {};
        if (Array.isArray(userObject[0]?.portalData?.[portalStem])) {
        userObject[0].portalData[portalStem].forEach(record => {
            const { 
                description = record[`${portalStem}::description`],
                unit = record[`${portalStem}::unit`],
                unitPrice = record[`${portalStem}::_unitPrice`],
                GST = record[`${portalStem}::f_taxableGST`],
                PST = record[`${portalStem}::f_taxablePST`],
                HST = record[`${portalStem}::f_taxableHST`],
                dapiRecordID = record[`${portalStem}::~dapiRecordID`], 
                ID = record[`${portalStem}::__ID`]
            } = record;
            const details = {
                unit,
                unitPrice,
                HST,
                GST,
                PST,
                ID,
                dapiRecordID,
            };

            if (newObject[description]) {
                newObject[description].push(details);
            } else {
                newObject[description] = [details];
            }
        })}
        return newObject
    };

    function createModulesObject(userObject, portalStem) {
        const newObject = {};
        if (Array.isArray(userObject[0]?.portalData?.[portalStem])) {
        userObject[0].portalData[portalStem].forEach(record => {
            const { 
                name = record[`${portalStem}::moduleName`],
                accessLevel = record[`${portalStem}::accessLevel`],
                dateEnd = record[`${portalStem}::dateEnd`],
                dateStart = record[`${portalStem}::dateStart`],
                GST = record[`${portalStem}::f_taxGST`],
                PST = record[`${portalStem}::f_taxPST`],
                HST = record[`${portalStem}::f_taxHST`],
                overagePrice = record[`${portalStem}::overagePrice`], 
                overageScheme = record[`${portalStem}::overageScheme`], 
                price = record[`${portalStem}::price`], 
                priceScheme = record[`${portalStem}::priceScheme`], 
                usageCap = record[`${portalStem}::usageCap`], 
                usageScheme = record[`${portalStem}::usageScheme`],
                dapiRecordID = record[`${portalStem}::~dapiRecordID`], 
                ID = record[`${portalStem}::__ID`]
            } = record;
            const details = {
                accessLevel,
                dateEnd,
                dateStart,
                HST,
                GST,
                PST,
                overagePrice, 
                overageScheme, 
                price, 
                priceScheme, 
                usageCap, 
                usageScheme,
                ID,
                dapiRecordID,
            };

            if (newObject[name]) {
                newObject[name].push(details);
            } else {
                newObject[name] = [details];
            }
        })}
        return newObject
    };

    const getUserData = async (filemakerId) => {
        console.log("Getting user data ...")
        
        let query = []
        //GET USER OBJECT RECORD
        const userLayout = "dapiPartyObject"
        query = [
            {"__ID": filemakerId}
        ];
        
        try{
            //GET USER INFO
            const filemakerUserObject = await readRecord(authState.token,{query},userLayout)
            if(filemakerUserObject.length===0){
                throw new Error("Error on getting user info from FileMaker")
            }
            console.log("user fetch successfull ...")
            const userObject = filemakerUserObject.response.data  
            //console.log({userObject}) 

            //Now that we have orgID, 
            //GET ORG INFO
            const orgLayout = "dapiOrganizationObject"
            query = [
                {"__ID": userObject[0].fieldData["_orgID"]}
            ];

            const filemakerOrgObject = await readRecord(authState.token,{query},orgLayout)
            if(filemakerOrgObject.length===0){
                throw new Error("Error on getting organization info from FileMaker")
            }
            console.log("org fetch successfull ...")
            const orgObject = filemakerOrgObject.response.data
            // console.log({orgObject}) 

            //GET USER PURCHASE HX
            const billableLayout = "dapiBillableObject"
            query = [
                {"_partyID": filemakerId}
            ];
            const filemakerBillableObject = await readRecord(authState.token,{query},billableLayout)
            if(filemakerBillableObject.length===0){
                throw new Error("Error on getting billable info from FileMaker")
            }
            console.log("billable fetch successfull ...")

            const billableObject = filemakerBillableObject.response.data
            let billableData = {}
            if (Array.isArray(billableObject)) {
                billableObject.map(bill => {
                    const description = bill.portalData.dapiBillableSellable[0]["dapiBillableSellable::description"]
                    const billable = {
                        GST: bill.fieldData.f_taxableGST,
                        HST: bill.fieldData.f_taxableHST,
                        PST: bill.fieldData.f_taxablePST,
                        GSTamount: bill.fieldData.gstAmount,
                        PSTamount: bill.fieldData.pstAmount,
                        HSTamount: bill.fieldData.hstAmount,
                        unit: bill.fieldData.unit,
                        unitPrice: bill.fieldData.unitPrice,
                        price: bill.fieldData.price,
                        quantity: bill.fieldData.quantity,
                        totalPrice: bill.fieldData.totalPrice,
                        dapiRecordID: bill.fieldData["~dapiRecordID"],
                        ID: bill.fieldData["__ID"],
                        orgID: bill.fieldData["_orgID"],
                        invoiceNum: bill.portalData.dapiBillableInvoice[0]["dapiBillableInvoice::invoiceNo"],
                        invoiceDate: bill.portalData.dapiBillableInvoice[0]["dapiBillableInvoice::date"],
                    }

                    if (billableData[description]) {
                        billableData[description].push(description);
                    } else {
                        billableData[description] = [billable];
                    }

                    return billableData
            })}
            //console.log({billableObject})
            //wo 
            //outcome
            //picture (before/after)

            //SET ORG, BILLABLE AND USER
            //USER
            const userInfo = {
                displayName: userObject[0].fieldData.displayName,
                firstName: userObject[0].fieldData.firstName,
                lastName: userObject[0].fieldData.lastName,
                dapiRecordID: userObject[0].fieldData["~dapiRecordID"],
                ID: userObject[0].fieldData["__ID"],
                orgID: userObject[0].fieldData["_orgID"],
            }
            //console.log({userInfo})
            const userAddress = createAddressObject(userObject,"dapiPartyAddress")
            //console.log({userAddress})
            const userEmail = createEmailObject(userObject,"dapiPartyEmail")
            //console.log({userEmail})
            const userDetails = createDetailsObject(userObject,"dapiPartyDetails")
            //console.log({userDetails})
            const userPhones = createPhonesObject(userObject,"dapiPartyPhone")
            //console.log({userPhones})
            const userRelated = createRelatedObject(userObject,"dapiPartyRelatedParties_partyID")

            //ORG 
            //info
            const orgInfo = {
                displayName: orgObject[0].fieldData.Name,
                website: orgObject[0].fieldData.website,
                ID: orgObject[0].fieldData["__ID"]
            };
            //gstNumber
            //wcbNumber
            //contactInfo

            const orgSellables = createSellableObject(orgObject,"dapiOrgSellable")
            //sellableItems
            const orgModules = createModulesObject(orgObject,"dapiOrgModules")
            //console.log({userInfo})
            const orgAddress = createAddressObject(orgObject,"dapiOrgAddress")
            //console.log({userAddress})
            const orgEmail = createEmailObject(orgObject,"dapiOrgEmail")
            //console.log({userEmail})
            const orgDetails = createDetailsObject(orgObject,"dapiOrgDetails")
            //console.log({userDetails})
            const orgPhones = createPhonesObject(orgObject,"dapiOrgPhone")
            //console.log({userPhones})
            const orgRelated = createRelatedObject(orgObject,"dapiOrgParties")
            //Modules


            const userData = {userInfo,userDetails,userAddress,userEmail,/*userMessages,*/userPhones,userRelated}
            const orgData = {orgInfo,orgDetails,orgAddress,orgEmail,/*orgMessages,*/orgPhones,orgSellables,orgModules,orgRelated}

            setUserData({userData,orgData,billableData});
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
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
                metaData = {
                  table: 'dapiAddress',
                  ID: address[`${portalStem}::__ID`],
                  recordID: address[`${portalStem}::~dapiRecordID`],
                  noMod: [""],
                }
            } = address;

            // Create an object for the address
            const addressDetails = {
                metaData,
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
                metaData = {
                  table: 'dapiEmail',
                  ID: record[`${portalStem}::__ID`],
                  recordID: record[`${portalStem}::~dapiRecordID`],
                  noMod: [""],
                }
            } = record;
            const details = {
                email,
                primary,
                metaData
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
      console.log("detailsObject...",{userObject},portalStem)
        const newObject = {};
        if (Array.isArray(userObject[0]?.portalData?.[portalStem])) {
        userObject[0].portalData[portalStem].forEach(record => {
            const { 
                type = record[`${portalStem}::type`],
                data = record[`${portalStem}::data`],
                metaData = {
                  table: 'dapiEmail',
                  ID: record[`${portalStem}::__ID`],
                  recordID: record[`${portalStem}::~dapiRecordID`],
                  noMod: ["data"],
                }
            } = record;
            const details = {
                data,
                metaData
            };

            if (newObject[type]) {
                newObject[type].push(details);
            } else {
                newObject[type] = [details];
            }
        })}
        return newObject
    };

    async function createConversationObject(userObject) {
        //GET MEMEBRSHIP INFO FROM CONVO OBJ
        const layout = "dapiConversationsObject"
        const memberQuery = [
            {"dapiConversationMembers::_memberID": userObject[0].fieldData["__ID"]}
        ];

        const conversationObject = await readRecord(authState.token,{query: memberQuery},layout)
        if(conversationObject.length===0){
            throw new Error("Error on getting organization info from FileMaker")
        }
        const data = conversationObject.response.data
        console.log("conversation data",{data},{conversationObject})
        const conversations = [];
        data.forEach(record => {
          const { fieldData, portalData } = record;
          
          // Check if the record is active
          if (fieldData.f_active !== 0 ) {  // Assuming f_active is a string
              const conversation = {
                  id: fieldData.__ID,
                  recordID: fieldData["~dapiRecordID"],
                  members: []
              };
  
              // Extract members if they exist in portalData
              if (portalData && portalData.dapiConversationMembers) {
                  portalData.dapiConversationMembers.forEach(member => {
                    if(member[`dapiConversationMembers::_memberID`] !==userObject[0].fieldData["__ID"]){
                      conversation.members.push({
                          memberId: member["dapiConversationMembers::_memberID"],
                          memberName: member["dapiConversationMembers::memberName"]
                      });
                    }
                  });
              }
  
              // Push the filled conversation object into the conversations array
              conversations.push(conversation);
          }
      });

        return conversations
    };

    function createPhonesObject(userObject, portalStem) {
        const newObject = {};
        if (Array.isArray(userObject[0]?.portalData?.[portalStem])) {
        userObject[0].portalData[portalStem].forEach(record => {
            const { 
                label = record[`${portalStem}::label`],
                phone = record[`${portalStem}::phone`],
                primary = record[`${portalStem}::f_primary`],
                sms = record[`${portalStem}::f_sms`],
                metaData = {
                  table: 'dapiPhone',
                  ID: record[`${portalStem}::__ID`],
                  recordID: record[`${portalStem}::~dapiRecordID`],
                  noMod: [""],
                }
            } = record;
            const details = {
                phone,
                primary,
                sms,
                metaData
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
                metaData = {
                  table: 'dapiRelatedParties_partyID',
                  ID: record[`${portalStem}::__ID`],
                  recordID: record[`${portalStem}::~dapiRecordID`],
                  noMod: ["type","partyID","relatedPartyID"],
                }
            } = record;
            const details = {
                partyID,
                relatedPartyID,
                metaData,
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
        console.log('Sellables...:',{userObject},portalStem)
        const newObject = {};
        if (Array.isArray(userObject[0]?.portalData?.[portalStem])) {
        userObject[0].portalData[portalStem].forEach(record => {
            const { 
                description = record[`${portalStem}::description`] || "",
                unit = record[`${portalStem}::units`],
                unitPrice = record[`${portalStem}::unitPrice`],
                GST = record[`${portalStem}::f_taxableGST`],
                PST = record[`${portalStem}::f_taxablePST`],
                HST = record[`${portalStem}::f_taxableHST`],
                qbItemID = record[`${portalStem}::qbItemID`], 
                qbTaxID = record[`${portalStem}::qbTaxID`],
                metaData = {
                  table: 'dapiSellable',
                  ID: record[`${portalStem}::__ID`],
                  recordID: record[`${portalStem}::~dapiRecordID`],
                  noMod: [""],
                }
            } = record;
            const details = {
                unit,
                unitPrice,
                HST,
                GST,
                PST,
                metaData,
                qbTaxID,
                qbItemID
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
      //console.log('moduleObjectCalled... ',{userObject},portalStem)
        const newObject = {};
        if (Array.isArray(userObject[0]?.portalData?.[portalStem])) {
        userObject[0].portalData[portalStem].forEach(record => {
            const { 
                name = record[`${portalStem}::moduleName`],
                active = record[`${portalStem}::f_active`],
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
                metaData = {
                  table: 'dapiModulesSelected',
                  ID: record[`${portalStem}::__ID`],
                  recordID: record[`${portalStem}::~dapiRecordID`],
                  noMod: [""],
                }
            } = record;
            const details = {
                active,
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
                metaData,
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
              billableObject.forEach(bill => {
                  const description = bill.portalData.dapiBillableSellable[0]["dapiBillableSellable::description"];
                  // Find the service provider where the field type is 'cleaner'
                  const serviceProviderEntry = bill.portalData.dapiBillableDetails.find(detail => detail["dapiBillableDetails::type"] === 'cleaner');
                  const serviceProvider = serviceProviderEntry ? serviceProviderEntry["dapiBillableDetails::data"] : {};
                  const ratingEntry = bill.portalData.dapiBillableDetails.find(detail => detail["dapiBillableDetails::type"] === 'rating');
                  const ratingData = ratingEntry ? ratingEntry["dapiBillableDetails::data"] : "";
                  const ratingObj = ratingData ? JSON.parse(ratingData) : {star:""}
                  const rating = ratingObj.star
                  const ratingDescription = ratingObj.description
                  const ratingRecordID = ratingEntry ? ratingEntry["dapiBillableDetails::~dapiRecordID"] : "";
                  const ratingRecordUUID = ratingEntry ? ratingEntry["dapiBillableDetails::__ID"] : "";
                  const cleanerEntry = bill.portalData.dapiBillableDetails.find(detail => detail["dapiBillableDetails::type"] === 'cleaner');
                  const cleanerData = cleanerEntry ? cleanerEntry["dapiBillableDetails::data"] : "";
                  const cleanerObj = cleanerData ? JSON.parse(cleanerData) : {cleaner: "", cleanerId: "", cleanerRecordId: "", cleanerRecordUUID: ""}
                  const cleaner = cleanerObj.cleaner
                  const cleanerID = cleanerObj.cleanerId
                  const cleanerRecordID = cleanerEntry ? cleanerEntry["dapiBillableDetails::~dapiRecordID"] : "";
                  const cleanerRecordUUID = cleanerEntry ? cleanerEntry["dapiBillableDetails::__ID"] : "" ;
                  const billable = {
                      GST: bill.fieldData.f_taxableGST,
                      GSTamount: bill.fieldData.gstAmount,
                      HST: bill.fieldData.f_taxableHST,
                      HSTamount: bill.fieldData.hstAmount,
                      PST: bill.fieldData.f_taxablePST,
                      PSTamount: bill.fieldData.pstAmount,
                      unit: bill.fieldData.unit,
                      unitPrice: bill.fieldData.unitPrice,
                      price: bill.fieldData.price,
                      quantity: bill.fieldData.quantity,
                      totalPrice: bill.fieldData.totalPrice,
                      invoiceNum: bill.portalData.dapiBillableInvoice[0]["dapiBillableInvoice::invoiceNo"],
                      invoiceDate: bill.portalData.dapiBillableInvoice[0]["dapiBillableInvoice::dateDue"],
                      serviceProvider,
                      rating,
                      ratingDescription,
                      cleaner,
                      cleanerID,
                      metaData: {
                        table: 'dapiBillable',
                        recordID: bill.fieldData["~dapiRecordID"],
                        ID: bill.fieldData["__ID"],
                        noMod: ["invoiceNum"],
                        // include any editable portal field's table, recordID, and UUID
                        invoiceDate: {table: 'dapiInvoice', recordID: bill.portalData.dapiBillableInvoice[0]["dapiBillableInvoice::~dapiRecordID"], ID: bill.portalData.dapiBillableInvoice[0]["dapiBillableInvoice::__ID"]},
                        cleaner: {table: 'dapiRecordDetails', recordID: cleanerRecordID, ID: cleanerRecordUUID},
                        rating: {table: 'dapiRecordDetails', recordID: ratingRecordID, ID: ratingRecordUUID, field: "data.star"},
                        ratingDescription: {table: 'dapiRecordDetails', recordID: ratingRecordID, ID: ratingRecordUUID,field: "data.description"}
                      }
                  };
          
                  // Check if the description key exists in billableData
                  if (billableData[description]) {
                      // If it exists, push the new billable object to the existing array
                      billableData[description].push(billable);
                  } else {
                      // If it doesn't exist, create a new array with the billable object
                      billableData[description] = [billable];
                  }
                  return billableData
              });
          }
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
                metaData: {
                  table: 'dapiParty',
                  recordID: userObject[0].fieldData["~dapiRecordID"],
                  ID: userObject[0].fieldData["__ID"],
                  orgID: userObject[0].fieldData["_orgID"],
                  noMod: [""],
                }
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
            const userConversations = await createConversationObject(userObject)

            //ORG 
            //info
            const orgInfo = {
                displayName: orgObject[0].fieldData.Name,
                website: orgObject[0].fieldData.website,
                ID: orgObject[0].fieldData["__ID"],
                metaData: {
                  table: 'dapiOrganization',
                  recordID: orgObject[0].fieldData["~dapiRecordID"],
                  ID: orgObject[0].fieldData["__ID"],
                  noMod: ["ID","displayName","website"],
                }
            };
            //gstNumber
            //wcbNumber
            //contactInfo

            const orgSellables = createSellableObject(orgObject,"dapiOrgSellable")
            //sellableItems
            const orgModules = createModulesObject(orgObject,"dapiOrgModulesSelected")
            //console.log({orgModules})
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


            const userData = {userInfo,userDetails,userAddress,userEmail,userConversations,userPhones,userRelated}
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

export const getValue = (state, path) => {
  // console.log('getValue ...', state,path);
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
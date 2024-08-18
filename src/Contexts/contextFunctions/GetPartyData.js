import { readRecord } from '../../FileMaker/readRecord.js';
import { createAddressObject } from './CreateAddressObj.js';
import { createEmailObject } from './CreateEmailObj.js'
import { createDetailsObject } from './CreateDetailsObj.js';
import { createConversationObject } from './CreateCommunicationObj.js';
import { createPhonesObject } from './CreatePhoneObj.js'; 
import { createRelatedObject } from './CreateRelatedObj.js';
import { createBillablesObject } from './CreateBillablesObj.js';


export const getPartyData = async (filemakerId,authState) => {
  console.log("getPartyData Called ...",filemakerId)
  
  let query = []
  //GET party OBJECT RECORD
  const partyLayout = "dapiPartyObject"
  query = [
      {"__ID": filemakerId}
  ];
  
  try{
      //GET party INFO
      const filemakerPartyObject = await readRecord(authState.userToken,{query},partyLayout)
      // console.log({filemakerPartyObject})
      if(filemakerPartyObject.length===0){
          throw new Error("Error on getting party info from FileMaker")
      }
      console.log("party fetch successfull ...")
      const partyObject = filemakerPartyObject.response.data  
      //console.log({partyObject}) 
      //wo 
      //outcome
      //picture (before/after)

      //PARTY
      const Info = {
          displayName: partyObject[0].fieldData.displayName,
          firstName: partyObject[0].fieldData.firstName,
          lastName: partyObject[0].fieldData.lastName,
          metaData: {
            table: 'dapiParty',
            recordID: partyObject[0].fieldData["~dapiRecordID"],
            ID: partyObject[0].fieldData["__ID"],
            orgID: partyObject[0].fieldData["_orgID"],
            noMod: [""],
          }
      }
      //console.log({Info})
      const Details = createDetailsObject(partyObject,"dapiPartyDetails")
      //console.log({Details})
      const Address = createAddressObject(partyObject,"dapiPartyAddress")
      //console.log({Address})
      const Email = createEmailObject(partyObject,"dapiPartyEmail")
      //console.log({Email})
      const Conversations = await createConversationObject(partyObject,authState)
      //console.log({Conversations})
      const Phones = createPhonesObject(partyObject,"dapiPartyPhone")
      //console.log({Phones})
      const Related = createRelatedObject(partyObject,"dapiPartyRelatedParties_partyID")
      //console.log({Related})
      const billableData = await createBillablesObject(filemakerId,authState)
      console.log({billableData})
      const partyData = {Info,Details,Address,Email,Conversations,Phones,Related,billableData}
      return {success: true,partyData};
  } catch (error) {
      return {success: false,error};
  }

}
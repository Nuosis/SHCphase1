import { readRecord } from '../../FileMaker/readRecord.js';
import { createAddressObject } from './CreateAddressObj.js';
import { createEmailObject } from './CreateEmailObj.js'
import { createDetailsObject } from './CreateDetailsObj.js';
import { createPhonesObject } from './CreatePhoneObj.js'; 
import { createRelatedObject } from './CreateRelatedObj.js';
import { createSellableObject } from './CreateSellableObj.js';
import { createModulesObject } from './CreateModulesObj.js';


export const getOrg = async (orgId,authState) => {
  console.log("Getting Org data ...")
  //GET ORG INFO
  const orgLayout = "dapiOrganizationObject"
  const query = [
      {"__ID": orgId}
  ];
  try{
      const filemakerOrgObject = await readRecord(authState.userToken,{query},orgLayout)
      if(filemakerOrgObject.length===0){
          throw new Error("Error on getting organization info from FileMaker")
      }
      console.log("org fetch returned ...")
      const orgObject = filemakerOrgObject.response.data
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
      const orgData = {orgInfo,orgDetails,orgAddress,orgEmail,/*orgMessages,*/orgPhones,orgSellables,orgModules,orgRelated}
      return {success: true,orgData};
  } catch (error) {
      return {success: false,error};
  }
}
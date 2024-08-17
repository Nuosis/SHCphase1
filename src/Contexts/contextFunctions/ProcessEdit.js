import React, { useState } from 'react';
import { getStateValue } from "./GetStateValue";
import Create from "../../FileMaker/CRUD/Create";
import { readRecord } from '../../FileMaker/readRecord';
import { deleteRecord } from '../../FileMaker/deleteRecord';
import { updateRecord } from '../../FileMaker/updateRecord';

export async function ProcessEdit(action, path, value, authState, setEdited, setPopup) {
  try {
    let payload = value ? value : ""
    const pathParts = path.split('.');
    const state = pathParts.shift();
    const key = pathParts.pop(); // Gets the last element
    const metaDataPath = [...pathParts, "metaData"].join('.');
    const metaData = getStateValue(state, metaDataPath);
    const isPortalRecord = typeof metaData[key] === 'object' && metaData[key] !== null;
    const table = isPortalRecord? metaData[key].table : metaData.table;
    const metaDataField = isPortalRecord? metaData[key].field : key;
    let UUID = isPortalRecord? metaData[key].ID : metaData.ID;
    let recordID = isPortalRecord? metaData[key].recordID : metaData.recordID;
    const fieldParts = metaDataField.split('.')
    const field = fieldParts[0];
    const fieldObjKey = fieldParts[1] ?  fieldParts[1] : null ;
    console.log({key},{payload},{metaData},{table},{field},{fieldObjKey},{recordID},{UUID})
    let record

    if (!recordID && !UUID) {
      // recordID and UUID being empty indicates the record does not yet exist and needs to be created
      console.log("calling create record ...",{key})
      record = await Create(authState.appToken,table,{fkID:metaData.ID,type:"rating"})
      recordID=record.response.data[0].recordId?record.response.data[0].recordId:null
      UUID=record.response.data[0].fieldData["__ID"]?record.response.data[0].fieldData["__ID"]:null
      // console.log("record received ...",{recordID, UUID})
      if (!recordID){
        setPopup({ show: true, message: "There was an issue in the way the data is stored and retrieved. Update unsuccessfull" });
        return
      }
    } else if (!recordID) {
      const query = [{"__ID": UUID}];
      const layout = table;
      console.log("getting recordID ...")
      record = await readRecord(authState.appToken, {query}, layout);
      if (record.length === 0) throw new Error("Error getting recordID from FileMaker");
      recordID = record.response.recordId?record.response.recordId:null
      if (!recordID){
        setPopup({ show: true, message: "There was an issue in the way the data is stored and retrieved. Update unsuccessfull" });
        return
      }
    } else if (isPortalRecord) {
      const query = [{"__ID": UUID}];
      const layout = table;
      console.log("getting record ...",{query},{layout})
      record = await readRecord(authState.appToken, {query}, layout);
      if (record.length === 0 || record === undefined) throw new Error("Error getting portal record from FileMaker");
    }
    console.log({record})


    if (fieldObjKey !== null){
      /*  data is set in field as part of a json object. 
          Get Object, update fieldObjKey with value and set
          value to json to be sent back
      */
        console.log("getting field json ...",{fieldObjKey})
        const data = record.response.data[0].fieldData;
        const jsonObj=JSON.parse(data[field])
        console.log({jsonObj})
        jsonObj[fieldObjKey]=value
        payload = jsonObj
        console.log("payload set",payload)
    }

    const layout = table;

    if (action === 'update') {
      const keyValue = !payload ? getStateValue(state, path) : payload;
      const stringValue = typeof keyValue === 'string' ? keyValue : JSON.stringify(keyValue);          
      const params = { fieldData: { [field]: stringValue } };
      // console.log({params})
      // console.log({layout,recordID})
      const data = await updateRecord(authState.appToken, params, layout, recordID);
      if (data.messages && data.messages[0].code !== "0") {
        throw new Error(`Failed to update record: ${data.messages[0].message}`);
      }
      console.log("update successful")
    } else if (action === 'delete') {
      const data = await deleteRecord(authState.appToken, layout, recordID);
      if (data.messages && data.messages[0].code !== "0") {
        throw new Error(`Failed to delete record: ${data.messages[0].message}`);
      }
    }
    // Remove the processed edit
    setEdited(prev => prev.slice(1));
  } catch (error) {
    console.error(`Error processing ${action}:`, error);
  }
};
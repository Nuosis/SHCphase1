import { getValue } from '../../UserContext.js';
import { createRecord } from '../createRecord.js';

const getSettings = (table, state, requiredValues) => {
  console.log("getSettings...",{table,state,requiredValues})
  if (table === "dapiRecordDetails") {
    if (!requiredValues.fkID) {
      throw new Error("fkID is required");
    }
    if (!requiredValues.type) {
      throw new Error("type is required");
    }
    if(requiredValues.type==="rating"){
      return {
        params: {
          fieldData: {
            "_fkID": requiredValues.fkID,
            "_orgID": getValue(state, "userData.orgData.orgInfo.metaData.ID"),
            data: "{\"star\":\"\",\"description\":\"\"}",
            type: requiredValues.type
          }
        },
        layout: table
      };
  } else {
    throw new Error(`Unsupported type: ${requiredValues.type}`);
  }
  } else {
    throw new Error(`Unsupported table: ${table}`);
  }
};

const Create = async (token, table, state, requiredValues) => {
  console.log("Create called ...")
  
  let settings;
  try {
    console.log("calling getSettings ...")
    settings = getSettings(table, state, requiredValues); // returns params, layout {database} {server}
  } catch (error) {
    console.error("Error getting settings:", error.message);
    throw error;
  }

  const { layout, params } = settings;
  console.log(`creating record in ${table} ...`);
  
  let data;
  try {
    console.log("Calling CreateRecord ...")
    data = await createRecord(token, params, layout, true);
  } catch (error) {
    console.error("Error creating record:", error.message);
    throw new Error(`Failed to create ${table} record in FileMaker: ${error.message}`);
  }

  if (!data || data.length === 0) {
    const errorMessage = `Error creating ${table} record in FileMaker: No data returned`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  return data;
};

export default Create;

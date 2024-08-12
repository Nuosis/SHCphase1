export function createEmailObject(userObject, portalStem) {
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
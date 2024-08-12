export function createDetailsObject(userObject, portalStem) {
  // console.log("detailsObject...",{userObject},portalStem)
  const newObject = {};
  if (Array.isArray(userObject[0]?.portalData?.[portalStem])) {
  userObject[0].portalData[portalStem].forEach(record => {
      const { 
          type = record[`${portalStem}::type`],
          data = record[`${portalStem}::data`],
          metaData = {
            table: 'dapirecordDetails',
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
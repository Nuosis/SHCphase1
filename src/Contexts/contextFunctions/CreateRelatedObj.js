export function createRelatedObject(userObject, portalStem) {
  const newObject = {};
  if (Array.isArray(userObject[0]?.portalData?.[portalStem])) {
  userObject[0].portalData[portalStem].forEach(record => {
      const { 
          type = record[`${portalStem}::type`] === "0" ? 'person':'company',
          displayName = record[`${portalStem}::displayName`],
          metaData = {
            table: 'dapiRelatedParties_partyID',
            ID: record[`${portalStem}::__ID`],
            recordID: record[`${portalStem}::~dapiRecordID`],
            noMod: [],
          }
      } = record;
      const details = {
          type,
          displayName,
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
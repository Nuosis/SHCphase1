export function createPhonesObject(userObject, portalStem) {
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
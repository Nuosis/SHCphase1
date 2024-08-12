export function createSellableObject(userObject, portalStem) {
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
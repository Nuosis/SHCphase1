export function createModulesObject(userObject, portalStem) {
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
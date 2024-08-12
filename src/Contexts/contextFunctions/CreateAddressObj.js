export function createAddressObject(userObject, portalStem) {
  // Initialize an empty object to store the addresses
  const addressObject = {};        
  if (Array.isArray(userObject[0]?.portalData?.[portalStem])) {
  userObject[0].portalData[portalStem].forEach(address => {
      // Extract address details
      const { 
          type = address[`${portalStem}::type`] || 'home',
          streetAddress = address[`${portalStem}::streetAddress`], 
          unitNumber = address[`${portalStem}::unitNumber`], 
          city = address[`${portalStem}::city`], 
          prov = address[`${portalStem}::prov`], 
          postalCode = address[`${portalStem}::postalCode`], 
          country = address[`${portalStem}::country`],
          metaData = {
            table: 'dapiAddress',
            ID: address[`${portalStem}::__ID`],
            recordID: address[`${portalStem}::~dapiRecordID`],
            noMod: [""],
          }
      } = address;

      // Create an object for the address
      const addressDetails = {
          metaData,
          street: streetAddress,
          unit: unitNumber,
          city,
          province: prov,
          postalCode,
          country
      };

      // Create a key using the address type and assign the address details

      if (addressObject[type]) {
          addressObject[type].push(addressDetails);
      } else {
          addressObject[type] = [addressDetails];
      }
  })}
  return addressObject
};
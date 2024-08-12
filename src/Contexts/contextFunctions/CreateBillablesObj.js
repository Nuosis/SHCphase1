import { readRecord } from '../../FileMaker/readRecord.js';

//GET USER PURCHASE HX
export async function getBillables(filemakerId,authState){
  const billableLayout = "dapiBillableObject"
  let query = [
      {"_partyID": filemakerId}
  ];
  const filemakerBillableObject = await readRecord(authState.token,{query},billableLayout)
  if(filemakerBillableObject.length===0){
      throw new Error("Error on getting billable info from FileMaker")
  }
  console.log("billable fetch successfull ...")
  console.log({filemakerBillableObject})
  let billableData = {}
  if(!filemakerBillableObject.error) {
    const billableObject = filemakerBillableObject.response.data
    if (Array.isArray(billableObject)) {
      billableObject.forEach(bill => {
          const description = bill.portalData.dapiBillableSellable[0]["dapiBillableSellable::description"];
          // Find the service provider where the field type is 'cleaner'
          const serviceProviderEntry = bill.portalData.dapiBillableDetails.find(detail => detail["dapiBillableDetails::type"] === 'cleaner');
          const serviceProvider = serviceProviderEntry ? serviceProviderEntry["dapiBillableDetails::data"] : {};
          const ratingEntry = bill.portalData.dapiBillableDetails.find(detail => detail["dapiBillableDetails::type"] === 'rating');
          const ratingData = ratingEntry ? ratingEntry["dapiBillableDetails::data"] : "";
          const ratingObj = ratingData ? JSON.parse(ratingData) : {star:""}
          const rating = ratingObj.star
          const ratingDescription = ratingObj.description
          const ratingRecordID = ratingEntry ? ratingEntry["dapiBillableDetails::~dapiRecordID"] : "";
          const ratingRecordUUID = ratingEntry ? ratingEntry["dapiBillableDetails::__ID"] : "";
          const cleanerEntry = bill.portalData.dapiBillableDetails.find(detail => detail["dapiBillableDetails::type"] === 'cleaner');
          const cleanerData = cleanerEntry ? cleanerEntry["dapiBillableDetails::data"] : "";
          const cleanerObj = cleanerData ? JSON.parse(cleanerData) : {cleaner: "", cleanerId: "", cleanerRecordId: "", cleanerRecordUUID: ""}
          const cleaner = cleanerObj.cleaner
          const cleanerID = cleanerObj.cleanerId
          const cleanerRecordID = cleanerEntry ? cleanerEntry["dapiBillableDetails::~dapiRecordID"] : "";
          const cleanerRecordUUID = cleanerEntry ? cleanerEntry["dapiBillableDetails::__ID"] : "" ;
          const billable = {
              GST: bill.fieldData.f_taxableGST,
              GSTamount: bill.fieldData.gstAmount,
              HST: bill.fieldData.f_taxableHST,
              HSTamount: bill.fieldData.hstAmount,
              PST: bill.fieldData.f_taxablePST,
              PSTamount: bill.fieldData.pstAmount,
              unit: bill.fieldData.unit,
              unitPrice: bill.fieldData.unitPrice,
              price: bill.fieldData.price,
              quantity: bill.fieldData.quantity,
              totalPrice: bill.fieldData.totalPrice,
              invoiceNum: bill.portalData.dapiBillableInvoice[0]["dapiBillableInvoice::invoiceNo"],
              invoiceDate: bill.portalData.dapiBillableInvoice[0]["dapiBillableInvoice::dateDue"],
              serviceProvider,
              rating,
              ratingDescription,
              cleaner,
              cleanerID,
              metaData: {
                table: 'dapiBillable',
                recordID: bill.fieldData["~dapiRecordID"],
                ID: bill.fieldData["__ID"],
                noMod: ["invoiceNum"],
                // include any editable portal field's table, recordID, and UUID
                invoiceDate: {table: 'dapiInvoice', recordID: bill.portalData.dapiBillableInvoice[0]["dapiBillableInvoice::~dapiRecordID"], ID: bill.portalData.dapiBillableInvoice[0]["dapiBillableInvoice::__ID"]},
                cleaner: {table: 'dapiRecordDetails', recordID: cleanerRecordID, ID: cleanerRecordUUID},
                rating: {table: 'dapiRecordDetails', recordID: ratingRecordID, ID: ratingRecordUUID, field: "data.star"},
                ratingDescription: {table: 'dapiRecordDetails', recordID: ratingRecordID, ID: ratingRecordUUID,field: "data.description"}
              }
          };

          // Check if the description key exists in billableData
          if (billableData[description]) {
              // If it exists, push the new billable object to the existing array
              billableData[description].push(billable);
          } else {
              // If it doesn't exist, create a new array with the billable object
              billableData[description] = [billable];
          }
          return billableData
      });
    }
  }
}
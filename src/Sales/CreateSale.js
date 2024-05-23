/**
 * A FUNCTION TO 
 *    CREATE Invoice, Billable and Scope in FileMaker
 *    Ensures customer is set up in QBO and STRIPE
 *    Creates QBO invoice
 * 
 * USEAGE EXAMPLE
 * 
 * const result = await createSale(userData,workOrderData,token);
 * if (result === true) {
 *   console.log("Sale process completed successfully.");
 * } else {
 *   console.error("Sale process failed:", result);
 * }
 */


import React, { useState } from 'react';
import { useWorkOrder } from '../WorkOrderContext';
import { useUser } from '../UserContext';
import { useAuth } from '../AuthContext';
import { createRecord } from '../FileMaker/createRecord';
import { deleteRecord } from '../FileMaker/deleteRecord';
import { callQBOApi } from './qbo';
import { callStripeApi } from './stripe';

// Compute totals
function computeTotals(lineItems) {
  const totals = { subTotal: 0, GST: 0 };
  lineItems.forEach(item => {
    if (item.description !== "GST") {
      totals.subTotal += item.amount;
    }
  });
  const gstItem = lineItems.find(item => item.description === "GST");
  if (gstItem) {
    totals.GST = gstItem.amount;
  }
  totals.total = totals.subTotal + totals.GST;
  return totals;
}

// Get Item ID from activity
function getItemIdFromActivity(activity, orgSellables) {
  // const sellableItem = orgSellables.find(item => item.key === activity);
  const sellableItem = orgSellables[activity];
  return sellableItem ? sellableItem[0].qbItemID : '38';  // Fallback to '12' if not found
}

// Get Tax Code from activity
function getTaxCodeFromActivity(activity, orgSellables) {
  const sellableItem = orgSellables[activity];
  return sellableItem ? sellableItem[0].qbTaxID : '4';  // Fallback to '4' if not found
}

// Create QBO line items
function createQboLineItems(workOrderData, isInvoice = true, orgSellables) {
  //console.log("orgSellables prop in createQBOLineItems", { orgSellables });

  // Filter out line items with description 'GST' before mapping
  const filteredLineTotals = workOrderData.lineTotals.filter(item => item.description !== "GST");

  return filteredLineTotals.map(item => {
    const lineItem = {
      Description: item.description,
      Amount: item.amount,
      DetailType: isInvoice ? "SalesItemLineDetail" : "ItemBasedExpenseLineDetail",
      [isInvoice ? "SalesItemLineDetail" : "ItemBasedExpenseLineDetail"]: {
        ItemRef: { value: getItemIdFromActivity(workOrderData.activity, orgSellables) },
        UnitPrice: item.amount,
        Qty: item.quantity || 1,
      }
    };

    //if (item.taxable) {
      lineItem[isInvoice ? "SalesItemLineDetail" : "ItemBasedExpenseLineDetail"].TaxCodeRef = {
        value: getTaxCodeFromActivity(workOrderData.activity, orgSellables)
      };
    //}

    console.log("lineItem: ", lineItem);
    return lineItem;
  });
}


async function createSale(userData,workOrderData,token) {
  // const { token } = useAuth();
  // const userData = useUser();
  // const workOrderData = useWorkOrder();
  const orgSellables = userData.orgData.orgSellables;
  const custID = userData.userData.userInfo.ID;
  const sellableID = orgSellables[workOrderData.activity][0].ID
  // console.log("sellableID: ",sellableID)

  try {
    const qboInfo = userData.userData.userDetails.qboInfo[0].data;
    const qboData = JSON.parse(qboInfo)
    // console.log(qboData)
    let qboId = qboData.id;
    if (!qboId) {
      try {
        const customerData = { DisplayName: userData.userData.userInfo.displayName, PrimaryEmailAddr: {Address: userData.userData.userEmail.main[0].email} };
        const qboCustomer = await callQBOApi(token, 'createCustomer', { customerData });
        qboId = qboCustomer.Customer.Id;
        await createRecord(token, { data: { "Id": qboId }, type: "qboInfo" }, 'dapiRecordDetails', false);
      } catch (error) {
        console.error('Error creating QBO customer:', error);
        return `Error creating QBO customer: ${error.message}`;
      }
    }

    let stripeInfo = userData.userData.userDetails.stripeInfo[0].data;
    const stripeData=JSON.parse(stripeInfo)
    let stripeId = stripeData.id
    if (!stripeId) {
      try {
        const stripeCustomer = await callStripeApi(token, 'addCustomer', { email: userData.userData.userEmail.main[0].email, name: userData.userData.userInfo.displayName });
        stripeId = stripeCustomer.id;
        await createRecord(token, { data: { "Id": stripeId }, type: "stripeInfo" }, 'dapiRecordDetails', false);
      } catch (error) {
        console.error('Error creating Stripe customer:', error);
        return `Error creating Stripe customer: ${error.message}`;
      }
    }
    // const totals = computeTotals(workOrderData.lineTotals);
    // console.log(totals)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');  // getMonth() is zero-indexed, add 1 to make it 1-indexed
    const day = String(now.getDate()).padStart(2, '0');
    const currentDate = `${year}+${month}+${day}`;
    const dueDate = workOrderData.cleaningDate.replace(/-/g, '+')

    const currentYear = new Date().getFullYear().toString().slice(-2); // Get last two digits of the year
    const invoiceNumStem = `${qboId}${currentYear}${month}`;
    
    const invoiceQuery = await callQBOApi(token, 'queryQBO', {entity: "Invoices", query: [{field: 'DocNumber', value: `${invoiceNumStem}`, operator: 'LIKE'}]});
    //console.log(invoiceQuery)
    const count = invoiceQuery.QueryResponse.totalCount ? invoiceQuery.QueryResponse.totalCount + 1 : 1;
    const invoiceNum = `${invoiceNumStem}${String(count).padStart(3, '0')}`;
    //console.log(invoiceNum)

    const fmInvoice = await createRecord(token, {fieldData:{"_custID":custID,invoiceNo: invoiceNum,dateDue: dueDate,date: currentDate,dateDay: day,dateMonth: month,dateYear: year}}, 'dapiInvoice', true);
    const invoiceId = fmInvoice.response.data[0].fieldData["__ID"];
    const invoiceFMID = fmInvoice.response.data[0].fieldData["~dapiRecordID"];
    // console.log("invoiceID: ",invoiceId)
    const qboLines=createQboLineItems(workOrderData, true, orgSellables)
    // console.log("qboLines: ",qboLines)

    const qboInvoice = await callQBOApi(token, 'createInvoice', {
      customerId: qboId,
      txnDate: new Date().toISOString().split('T')[0],
      lineItems: qboLines,
      currencyCode: "CAD",
      docNumber: invoiceNum
    });
    console.log("qboInvoice: ",qboInvoice)
    const qboInvoiceID = qboInvoice.Id;
    //console.log("qboInvoiceID: ",qboInvoiceID)
    if(!qboInvoiceID){
      console.error("qboInvoiceID unset")
      await deleteRecord(token, 'dapiInvoice', invoiceFMID)
      throw new Error("qboInvoiceID is unset")
    }

    const billable = await createRecord(token, { fieldData:{ "_partyID":custID,"_sellableID":sellableID,"_invoiceID": invoiceId, description: workOrderData.activity, totalPrice: workOrderData.price, quantity: 1, unit: "service" }}, 'dapiBillable', true);
    // console.log("billableObj: ",billable)
    const billableID = billable.response.data[0].fieldData["__ID"];
    // console.log("billableID: ",billableID)
    if(!billableID){
      console.error("billableID unset")
      await deleteRecord(token, 'dapiInvoice', invoiceFMID)
      await callQBOApi(token, 'deleteInvoice', {invoiceId: qboInvoiceID})
      throw new Error("qboInvoiceID is unset")
    }
    const billableFMID = billable.response.data[0].fieldData["~dapirecordID"];

    let createdScopeIDs
    try {
      for (const task of [...workOrderData.tasks.highPriority, ...workOrderData.tasks.lowPriority]) {
        const detail = workOrderData.tasks.highPriority.includes(task) ? "High Priority" : "Low Priority";
        const result = await createRecord(token, { fieldData: {_fkID: billableID, label: task, detail } }, 'dapiScope', true);
        const resultID = result.response.data[0].fieldData["__ID"];
        const resultFMID = result.response.data[0].fieldData["~dapiRecordID"];
        if (!resultID) {
          throw new Error("resultID is unset");
        }
        createdScopeIDs.push(resultFMID);  // Collecting successfully created scope IDs
      }
    } catch (error) {
      console.error("Error creating scopes, cleaning up:", error);
      // Cleanup all created scopes on error
      for (const scopeFMID of createdScopeIDs) {
        await deleteRecord(token, 'dapiScope', scopeFMID);
      }
      // Additional cleanup for billable and invoice records
      await deleteRecord(token, 'dapiBillable', billableFMID);
      await callQBOApi(token, 'deleteInvoice', { invoiceId: qboInvoiceID });
      await deleteRecord(token, 'dapiInvoice', invoiceFMID);
      throw error;  // Rethrowing the error to be handled by the outer catch block
    }
    return true;  // Return true indicating success
  } catch (error) {
    console.error('Error processing sale:', error);
    return `Error processing sale: ${error.message}`;  // Return the error message
  }
}

export default createSale;

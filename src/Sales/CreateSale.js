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
import { callQBOApi } from './qbo';
import { callStripeApi } from './stripe';

// Compute totals
function computeTotals(lineItems) {
  const totals = { subTotal: 0, GST: 0 };
  lineItems.forEach(item => {
    if (item.description !== "GST") {
      totals.subTotal += item.lineTotal;
    }
  });
  const gstItem = lineItems.find(item => item.description === "GST");
  if (gstItem) {
    totals.GST = gstItem.lineTotal;
  }
  totals.total = totals.subTotal + totals.GST;
  return totals;
}

// Get Item ID from activity
function getItemIdFromActivity(activity, orgSellables) {
  const sellableItem = orgSellables.find(item => item.key === activity);
  return sellableItem ? sellableItem.qbItemID : '12';  // Fallback to '12' if not found
}

// Get Tax Code from activity
function getTaxCodeFromActivity(activity, orgSellables) {
  const sellableItem = orgSellables.find(item => item.key === activity);
  return sellableItem ? sellableItem.qbTaxID : '4';  // Fallback to '4' if not found
}

// Create QBO line items
function createQboLineItems(workOrderData, isInvoice, orgSellables) {
  return workOrderData.lineTotals.map(item => {
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
    if (item.taxable) {
      lineItem[isInvoice ? "SalesItemLineDetail" : "ItemBasedExpenseLineDetail"].TaxCodeRef = {
        value: getTaxCodeFromActivity(workOrderData.activity, orgSellables)
      };
    }
    return lineItem;
  });
}

async function createSale(userData,workOrderData,token) {
  // const { token } = useAuth();
  // const userData = useUser();
  // const workOrderData = useWorkOrder();
  const orgSellables = userData.orgData.orgSellables;

  try {
    const qboInfo = userData.userData.userDetails.qboInfo[0].data;
    const qboData = JSON.parse(qboInfo)
    console.log(qboData)
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

    const totals = computeTotals(workOrderData.lineTotals);
    const invoiceNumStem = `${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${qboId}`;
    const invoiceQuery = await callQBOApi(token, 'queryQBO', {params: {entity: "Invoice", query: [{field: 'DocNumber', value: invoiceNumStem&'%', operator: 'LIKE'}]}});
    console.log(invoiceQuery)
    const invoiceNum = `${invoiceNumStem}${String(invoiceQuery.QueryResponse.totalCount + 1).padStart(3, '0')}`;

    const fmInvoice = await createRecord(token, { data: { invoiceNum, totalPrice: totals.total }, type: "invoice" }, 'dapiInvoice', true);
    const invoiceId = fmInvoice.response.data[0].fieldData["__ID"];

    const qboInvoice = await callQBOApi(token, 'createInvoice', {
      customerId: qboId,
      txnDate: new Date().toISOString().split('T')[0],
      lineItems: createQboLineItems(workOrderData, true, orgSellables),
      currencyCode: "CAD"
    });
    const qboInvoiceID = qboInvoice.Invoice.Id;

    await createRecord(token, { description: workOrderData.activity, totalPrice: workOrderData.price, quantity: 1, unit: "service" }, 'dapiBillable', true);

    for (const task of workOrderData.tasks.highPriority) {
      await createRecord(token, { _fkID: invoiceId, label: task, detail: "High Priority" }, 'dapiScope', false);
    }
    for (const task of workOrderData.tasks.lowPriority) {
      await createRecord(token, { _fkID: invoiceId, label: task, detail: "Low Priority" }, 'dapiScope', false);
    }

    return true;  // Return true indicating success
  } catch (error) {
    console.error('Error processing sale:', error);
    return `Error processing sale: ${error.message}`;  // Return the error message
  }
}

export default createSale;

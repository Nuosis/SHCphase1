import React from 'react';
import { WorkOrderProvider } from './WorkOrderContext'; // Import your AuthContext
import { UserProvider } from './UserContext';
import readRecord from './FileMaker/readRecord'
import createRecord from './FileMaker/createRecord'

function computeTotals(lineItems) {
  const totals = {};
  // Initialize subtotal
  totals.subTotal = 0;

  // Initialize GST
  totals.GST = 0;

  // Calculate subtotal by summing lineTotals that are not for GST
  lineItems.forEach(item => {
      if (item.description !== "GST") {
          totals.subTotal += item.lineTotal;
      }
  });

  // Find the GST amount from the line item with description "GST"
  const gstItem = lineItems.find(item => item.description === "GST");
  if (gstItem) {
      totals.GST = gstItem.lineTotal;
  }

  // Calculate the total amount including GST
  totals.total = totals.subTotal + totals.GST;
  return totals
}

const createSale = () => {
  //get customerID from userData.userData.userInfo.ID
  //    get qbID from details (or create)
  //    get stripeID from details (or create)
  //get orgID from userData.orgData.orgInfo.ID
  //get totals from workOrderData.lineTotals
  //Create Invoice using create record
  //    Use totals to get billable amount
  //    get invoice id
  //    get invoiceNum
  //Create Billable using create record (connect invoice and sellable)
  //    get billable id
  //Create Scope using Create Record for each cleaning task
}
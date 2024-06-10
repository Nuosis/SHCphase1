import React, { createContext, useContext, useState } from 'react';
import {readRecord} from './FileMaker/readRecord'

const WorkOrderContext = createContext();

export const useWorkOrder = () => {
    return useContext(WorkOrderContext);
};

export const WorkOrderProvider = ({ children }) => {
    const [workOrderData, setWorkOrderData] = useState({});
    const [newWorkOrderData, setNewWorkOrderData] = useState({});

    const value = {
        workOrderData,
        setWorkOrderData,
        newWorkOrderData,
        setNewWorkOrderData,
    };

    return (
        <WorkOrderContext.Provider value={value}>
            {children}
        </WorkOrderContext.Provider>
    );
};

export const prepareWorkOrderData = async (token, userData, date, activity) => {
  console.log('prepareWorkOrderData:')
  // console.log({token},{userData},date,activity)

  const dateFormat = /\d{1,2}\/\d{1,2}\/\d{4}/; // Pattern to match MM/DD/YYYY format

  // Find the billable record based on date and activity
  const billableRecords = userData.billableData[activity];
  const billableRecord = billableRecords.find(record => {
    const formattedDate = new Date(record.invoiceDate);
    return dateFormat.test(record.invoiceDate) 
      ? `${formattedDate.getFullYear()}-${(formattedDate.getMonth() + 1).toString().padStart(2, '0')}-${formattedDate.getDate().toString().padStart(2, '0')}` === date
      : record.invoiceDate === date;
  });

  if (!billableRecord) {
    console.error('No matching billable record found');
    return;
  }

  const ID = billableRecord.ID;

  // Fetch scope data using the ID from the billable record
  const params = {
    query: [{ "_fkID": ID }]
  };
  const layout = "dapiScope";
  try {
    const scopeResponse = await readRecord(token, params, layout);
    const scopeData = scopeResponse.response.data.map(item => ({
      detail: item.fieldData.detail,
      label: item.fieldData.label
    }));
    // console.log({scopeData})

    // Replicate the structure seen in workOrderData from the second image
    const woData = {
      activity: activity,
      cleaningDate: date,
      lineTotals: [
        { description: activity, amount: parseFloat(billableRecord.totalPrice) },
        { description: "GST", amount: parseFloat(billableRecord.totalPrice-(billableRecord.totalPrice/1.05)) }
      ],
      invoiceNo: billableRecord.invoiceNum,
      price: parseFloat(billableRecord.totalPrice),
      tasks: {
        highPriority: scopeData.filter(item => item.detail === "High Priority").map(item => item.label),
        lowPriority: scopeData.filter(item => item.detail === "Low Priority").map(item => item.label)
      }
    };
    return woData
  } catch (error) {
    console.error('Error fetching scope data:', error);
    return;
  }
};
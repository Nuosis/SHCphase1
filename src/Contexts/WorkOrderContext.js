import React, { createContext, useContext, useState } from 'react';
import {readRecord} from '../FileMaker/readRecord'

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
  console.log('prepareWorkOrderData:');
  console.log(date, activity);

  const normalizeDate = (date) => {
    const dateParts = date.split(/[-/]/);
    if (dateParts.length === 3) {
      const [part1, part2, part3] = dateParts;
      if (part1.length === 4) {
        // Date is in YYYY-MM-DD format
        return new Date(`${part1}-${part2.padStart(2, '0')}-${part3.padStart(2, '0')}`).toISOString().split('T')[0];
      } else {
        // Date is in MM/DD/YYYY or M/D/YYYY format
        const year = part3;
        const month = part1.padStart(2, '0');
        const day = part2.padStart(2, '0');
        return new Date(`${year}-${month}-${day}`).toISOString().split('T')[0];
      }
    }
    return null;
  };

  const normalizedDate = normalizeDate(date);
  if (!normalizedDate) {
    console.error('Invalid date format');
    return;
  }

  // Find the billable record based on date and activity
  const billableRecords = userData.billableData[activity];
  const billableRecordIndex = billableRecords.findIndex(record => {
    const recordDate = normalizeDate(record.invoiceDate);
    return recordDate === normalizedDate;
  });

  if (billableRecordIndex === -1) {
    console.error('No matching billable record found');
    return;
  }

  const billableRecord = billableRecords[billableRecordIndex];
  const path = `billableData.${activity}[${billableRecordIndex}]`

  if (!billableRecord) {
    console.error('No matching billable record found');
    return;
  }
  console.log({billableRecord});

  const ID = billableRecord.metaData.ID;
  const rating = billableRecord.rating ? billableRecord.rating : 0 ;
  const ratingDescription = billableRecord.ratingDescription ? billableRecord.ratingDescription : "" ;
  const cleaner = billableRecord.cleaner;

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
        { description: activity, amount: parseFloat(billableRecord.price) },
        { description: "GST", amount: parseFloat(billableRecord.totalPrice-(billableRecord.totalPrice/1.05)) }
      ],
      invoiceNo: billableRecord.invoiceNum,
      price: parseFloat(billableRecord.totalPrice),
      tasks: {
        highPriority: scopeData.filter(item => item.detail === "High Priority").map(item => item.label),
        lowPriority: scopeData.filter(item => item.detail === "Low Priority").map(item => item.label)
      },
      rating,
      ratingDescription,
      cleaner,
      path
    };
    return woData
  } catch (error) {
    console.error('Error fetching scope data:', error);
    return;
  }
};
import React, { useState } from 'react';
import { IconButton } from '../UI Elements/Button';
import HeaderCard from '../UI Elements/HeaderCard';
import { prepareWorkOrderData } from '../WorkOrderContext';
import Popup from '../UI Elements/Popup';

const CreditCardDetails = ({ token, userData, setActiveComponent, setWorkOrderData }) => {
  const [popup, setPopup] = useState({ show: false, message: '' });

  const headerTextStyle = {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '24px'
  };

  const handleWorkOrderChange = async (date, activity) => {
    try {
      const woData = await prepareWorkOrderData(token, userData, date, activity);
      if (woData) {
        setWorkOrderData(woData);
        setActiveComponent('WorkOrderReport');
      } else {
        setPopup({ show: true, message: "No work order data found for the selected date." });
      }
    } catch (error) {
      setPopup({ show: true, message: error.message });
    }
  };

  const renderPaymentHistory = (userData) => {
    const billables = userData.billableData;
    const sortedBills = Object.entries(billables).map(([key, records]) => {
      const activity = key;
      const sortedDetails = records.sort((a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate));
      return [activity, sortedDetails];
    });
    return sortedBills.map(([activity, records]) => (
      <div key={activity}>
        <div className="text-lg font-bold">{activity}</div>
        {records.map((record) => (
          <div
            key={record.invoiceDate}
            className="cursor-pointer"
            onClick={() => handleWorkOrderChange(new Date(record.invoiceDate).toISOString().slice(0, 10), activity)}
          >
            {new Date(record.invoiceDate).toISOString().slice(0, 10)}
          </div>
        ))}
      </div>
    ));
  };

  return (
    <>
      {popup.show && (
        <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50" style={{ zIndex: 30 }}>
          <Popup message={popup.message} onClose={() => setPopup({ ...popup, show: false })} />
        </div>
      )}
      <HeaderCard headerText="Payment History" headerTextStyle={headerTextStyle}>
        <div className="space-y-4 p-4">
          {renderPaymentHistory(userData)}
        </div>
      </HeaderCard>
      <HeaderCard headerText="Manage Credit Card" headerTextStyle={headerTextStyle}>
          <div className="space-y-4 p-4 pt-4">
            <IconButton className="btn btn-primary" type="submit" text="Update Credit Card" onClick={()=>{setActiveComponent('CreditCardForm')}} />
          </div>
      </HeaderCard>
    </>
  );
};

export default CreditCardDetails;

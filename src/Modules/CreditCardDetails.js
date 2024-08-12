import React, { useState } from 'react';
import { IconButton } from '../UI Elements/Button';
import HeaderCard from '../UI Elements/HeaderCard';
import { prepareWorkOrderData } from '../Contexts/WorkOrderContext';
import Popup from '../UI Elements/Popup';

const CreditCardDetails = ({ token, userData, setActiveComponent, setWorkOrderData }) => {
  const [popup, setPopup] = useState({ show: false, message: '' });

  const headerTextStyle = {
  };

  const handleWorkOrderChange = async (date, activity) => {
    console.log({date},{activity})
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
        <h2 className="text-lg font-bold mb-4 text-primary dark:text-secondary">{activity}</h2>
        {records.map((record) => (
          <IconButton
            icon="InsertDriveFile"
            text={new Date(record.invoiceDate).toISOString().slice(0, 10)}
            className="btn btn-outline dark:btn-outline dark:text-gray-500 btn-sm mb-4 block"
            onClick={() => handleWorkOrderChange(record.invoiceDate, activity)}
          >
            {new Date(record.invoiceDate).toISOString().slice(0, 10)}
          </IconButton>
        ))}
      </div>
    ));
  };

  return (
    <>
      <div className="flex-grow items-stretch justify-center flex-grow">
        <div className="flex flex-col items-center justify-center flex-grow">
          {popup.show && (
            <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50" style={{ zIndex: 30 }}>
              <Popup message={popup.message} onClose={() => setPopup({ ...popup, show: false })} />
            </div>
          )}
          <HeaderCard headerText="Payment History" headerTextStyle={headerTextStyle}>
              {renderPaymentHistory(userData)}
          </HeaderCard>
          <HeaderCard headerText="Manage Credit Card" headerTextStyle={headerTextStyle}>
              <IconButton
                icon="CreditCard"
                className="btn btn-primary mb-4"
                type="submit"
                text="Update Credit Card"
                onClick={()=>{setActiveComponent('CreditCardForm')}}
              />
          </HeaderCard>
        </div>
      </div>
    </>
  );
};

export default CreditCardDetails;

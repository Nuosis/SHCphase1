import React, { useState } from 'react';
import { IconButton } from '../UI Elements/Button';
import { prepareWorkOrderData } from '../WorkOrderContext';
import HeaderCard from '../UI Elements/HeaderCard';
import Popup from '../UI Elements/Popup.js'

const CreditCardForm = ({ token, userData, setActiveComponent, setWorkOrderData}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [popup, setPopup] = useState({ show: false, message: '' });

  const headerTextStyle = {
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: '24px'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const creditCardData = {
      cardNumber,
      expiryDate,
      cvc,
      cardholderName,
    };

    // make api call to submit cc information
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
      const activity= key
      // Sort the details array by date from newest to oldest
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
            onClick={() => handleWorkOrderChange(new Date(record.invoiceDate).toISOString().slice(0, 10),activity)}
          >
            {new Date(record.invoiceDate).toISOString().slice(0, 10)}
          </div>
        ))}
      </div>
    ));
  };

  return (
    <>
      {/* Overlay and POPUP */}
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
      <HeaderCard headerText="Credit Card" headerTextStyle={headerTextStyle}>
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Cardholder Name</label>
            <input
              type="text"
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Card Number</label>
            <input
              type="text"
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              required
            />
          </div>
          <div className="flex space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
              <input
                type="text"
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="MM/YY"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">CVC</label>
              <input
                type="text"
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="pt-4">
            <IconButton className="btn btn-primary" type="submit" text="Submit Payment" />
          </div>
        </form>
      </HeaderCard>
    </>
  );
};

export default CreditCardForm;
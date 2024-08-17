import React, { /*useState, /*useEffect*/ } from 'react';
import { useUser } from '../Contexts/UserContext.js';
import CardContainer  from '../UI Elements/CardContainer';
import CardInput from '../UI Elements/CardInput.js';
import CardDelete from '../UI Elements/CardDelete.js';

const InformationCard = ({ setEdited }) => {
  const { userData, setUserData } = useUser();
  const infoData = userData.Info;
  const addressData = userData.Address;
  const emailData = userData.Email;
  const phoneData = userData.Phones;

  // Helper function to format phone numbers
  function formatNumber(phoneNumber) {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const lastTenDigits = cleanNumber.slice(-10);
    if (lastTenDigits.length === 10) {
      return `(${lastTenDigits.slice(0, 3)}) ${lastTenDigits.slice(3, 6)}-${lastTenDigits.slice(6)}`;
    } else {
      return cleanNumber;
    }
  }

  // Function to render card data
  const renderElements = () => {
    const details = [];

    // Render Info
    if (infoData) {
      details.push({
        id: "infoGroup-user-info",
        headerText: "Name",
        headerHiddenText: { Null: userData.Info.displayName },
        defaultOpen: true,
        flex: "row",
        children: (
          <>
            <CardInput
              label="First Name"
              type="text"
              id="firstName"
              childType="field"
              parentclassName="space-y-4 mr-8"
              state={userData}
              setState={setUserData}
              stateKey="userData.Info.firstName"
              setEdited={setEdited}
            />
            <CardInput
              label="Last Name"
              type="text"
              id="lastName"
              childType="field"
              parentclassName="space-y-4 mr-8"
              state={userData}
              setState={setUserData}
              stateKey="userData.Info.lastName"
              setEdited={setEdited}
            />
          </>
        )
      });
    }

    // Render Address Information
    if (addressData) {
      details.push({
        id: "address",
        headerText: "Address",
        headerHiddenText: {},
        state: userData,
        setState: setUserData,
        setEdited: setEdited,
        defaultOpen: false,
        flex: "col",
        children: (
          <>
            {Object.entries(addressData).map(([type, addresses]) =>
              addresses.map((address, index) => (
                <React.Fragment key={`${type}-${index}`}>
                  <CardInput
                    label="Street"
                    type="text"
                    id={`street-${type}-${index}`}
                    childType="field"
                    inputclassName="w-80"
                    state={userData}
                    setState={setUserData}
                    stateKey={`userData.Address.${type}[${index}].street`}
                    setEdited={setEdited}
                  />
                  <CardInput
                    label="City"
                    type="text"
                    id={`city-${type}-${index}`}
                    childType="field"
                    inputclassName="w-80"
                    state={userData}
                    setState={setUserData}
                    stateKey={`userData.Address.${type}[${index}].city`}
                    setEdited={setEdited}
                  />
                  <CardInput
                    label="Province"
                    type="text"
                    id={`province-${type}-${index}`}
                    childType="field"
                    inputclassName="w-80"
                    state={userData}
                    setState={setUserData}
                    stateKey={`userData.Address.${type}[${index}].province`}
                    setEdited={setEdited}
                  />
                  <CardInput
                    label="Postal Code"
                    type="text"
                    id={`postalCode-${type}-${index}`}
                    childType="field"
                    state={userData}
                    setState={setUserData}
                    stateKey={`userData.Address.${type}[${index}].postalCode`}
                    setEdited={setEdited}
                  />
                </React.Fragment>
              ))
            )}
          </>
        )
      });
    }

    // Render Email Information
    if (emailData) {
      details.push({
        id: "email",
        headerText: "Email",
        headerHiddenText: {},
        state: userData,
        setState: setUserData,
        setEdited: setEdited,
        defaultOpen: false,
        flex: "col",
        onNew: true,
        children: (
          <>
            {Object.entries(emailData).map(([key, emails]) =>
              emails.map((emailDetail, index) => (
                <React.Fragment key={`${key}-${index}`}>
                  <div className="flex flex-grow">
                    <CardInput
                      key={`email-${key}-${index}`}
                      label={`${key.charAt(0).toUpperCase() + key.slice(1)}`}
                      type="email"
                      id={`email-${key}-${index}`}
                      childType="field"
                      inputclassName="w-80"
                      state={userData}
                      setState={setUserData}
                      stateKey={`userData.Email.${key}[${index}].email`}
                      setEdited={setEdited}
                      value={emailDetail.email}
                    />
                    <CardDelete
                      key={`email-delete-${key}-${index}`}
                      label={`${key.charAt(0).toUpperCase() + key.slice(1)}`}
                      type="email"
                      id={`email-delete-${key}-${index}`}
                      childType="field"
                      inputclassName="w-80"
                      state={userData}
                      setState={setUserData}
                      stateKey={`userData.Email.${key}[${index}].email`}
                      setEdited={setEdited}
                      value={emailDetail.email}
                    />
                  </div>
                </React.Fragment>
              ))
            )}
          </>
        )
      });
    }

    // Render Phone Information
    if (phoneData) {
      details.push({
        id: "phone-card",
        headerText: "Phone",
        headerHiddenText: {},
        state: userData,
        setState: setUserData,
        setEdited: setEdited,
        defaultOpen: false,
        flex: "col",
        onNew: true,
        children: (
          <>
            {Object.entries(phoneData).map(([key, phones]) =>
              phones.map((phoneDetail, index) => (
                <React.Fragment key={`${key}-${index}`}>
                  <div className="flex flex-grow">
                    <CardInput
                      key={`tel-${key}-${index}`}
                      label={`${key}`}
                      type="tel"
                      id={`phone-${key}-${index}`}
                      childType="tel"
                      state={userData}
                      setState={setUserData}
                      stateKey={`userData.Phones.${key}[${index}].phone`}
                      setEdited={setEdited}
                      value={formatNumber(phoneDetail.phone)}
                      placeholder="(123) 456-7890"
                    />
                    <CardDelete
                      key={`tel-delete-${key}-${index}`}
                      label={`${key}`}
                      type="tel"
                      id={`phone-delete-${key}-${index}`}
                      childType="tel"
                      state={userData}
                      setState={setUserData}
                      stateKey={`userData.Phones.${key}[${index}].phone`}
                      setEdited={setEdited}
                      value={formatNumber(phoneDetail.phone)}
                    />
                  </div>
                </React.Fragment>
              ))
            )}
          </>
        )
      });
    }

    return details;
  };

  // JSX
  return (
    <div className="items-stretch justify-center flex-grow">
        <CardContainer cardsData={renderElements()} />
    </div>
  );
};

export default InformationCard;
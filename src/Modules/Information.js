import React, { useState, useEffect } from 'react';
import { useUser } from '../UserContext.js';
// import HeaderCard from '../UI Elements/HeaderCard';
// import {Accordion} from '../UI Elements/Accordion.js';
import {IconButton} from '../UI Elements/Button';
import Card from '../UI Elements/Card.js';
import CardInput from '../UI Elements/CardInput.js';

const InformationCard = ({json, onSubmitInformation, edited, setEdited}) => {
  const { userData, setUserData } = useUser();
  const [infoData, setInfoData] = useState(userData.userData.userInfo);
  const [addressData, setAddressData] = useState(userData.userData.userAddress);
  const [emailData, setEmailData] = useState(userData.userData.userEmail);
  const [phoneData, setPhoneData] = useState(userData.userData.userPhones);

  //console.log({addressData})

  //HANDLERS
  const handleAddressChange = (type, key, value) => {
      // Update local address data
      setAddressData(prev => {
          // Assuming there's always at least one object under the 'home' key
          const updatedAddress = {...prev[type][0], [key]: value};  // Update only the specified field
          return {
              ...prev,
              [type]: [updatedAddress]  // Replace the existing array with the new address object
          };
      });

      // Update global user data
      setUserData(prevUserData => ({
          ...prevUserData,
          userData: {
              ...prevUserData.userData,
              userAddress: {
                  ...prevUserData.userData.userAddress,
                  [type]: [{...prevUserData.userData.userAddress[type][0], [key]: value}]  // Update the address in the global state
              }
          }
      }));

      // Updating 'edited' to indicate a specific field has been edited
      setEdited(prev => ({
          ...prev,
          [`${type}Address`]: { ...prev[`${type}Address`], [key]: true }
      }));
  };

  const handleEmailChange = (key, value) => {
      setEmailData(prev => {
          const updatedEmail = {...prev[key][0], email: value};  // Modify only the 'email' field
          return {
              ...prev,
              [key]: [updatedEmail]
          }
      });    
      // This step integrates the updated email data back into the global user context state
      setUserData(prevUserData => ({
          ...prevUserData,
          userData: {
              ...prevUserData.userData,
              userEmail: {
                  ...prevUserData.userData.userEmail,
                  [key]: [{...prevUserData.userData.userEmail[key][0], email: value}] // Update the email in the global state
              }
          }
      }));
  
      // Updating 'edited' to indicate a specific field has been edited
      setEdited(prev => ({
          ...prev,
          email: { ...prev.email, [key]: true }
      }));
  };

  const handlePhoneChange = (key, value) => {
    // Update phone data with the raw input for ongoing edits
    setPhoneData(prev => ({
        ...prev,
        [key]: [{...prev[key][0], phone: value, rawInput: value}]  // Store the raw input for editing
    }));
  };

  function formatNumber(phoneNumber) {
    // Remove all non-digit characters from the string
    const cleanNumber = phoneNumber.replace(/\D/g, '');

    // Ensure only the last 10 digits are considered
    const lastTenDigits = cleanNumber.slice(-10);
    //console.log(`(${lastTenDigits.slice(0, 3)}) ${lastTenDigits.slice(3, 6)}-${lastTenDigits.slice(6)}`)

    // Check if the number has exactly 10 digits, then format it
    if (lastTenDigits.length === 10) {
        return `(${lastTenDigits.slice(0, 3)}) ${lastTenDigits.slice(3, 6)}-${lastTenDigits.slice(6)}`;
    } else {
        // Return the original cleaned number if it doesn't have 10 digits
        return cleanNumber;
    }
  }
  
  const handlePhoneBlur = (key, value) => {
    const formattedValue = formatNumber(value);
    setPhoneData(prev => ({
      ...prev,
      [key]: [{...prev[key][0], phone: formattedValue}] 
    }));
    
    // This step integrates the updated phone data back into the global user context state
    setUserData(prevUserData => ({
      ...prevUserData,
      userData: {
          ...prevUserData.userData,
          userPhones: {
              ...prevUserData.userData.userPhones,
              [key]: [{...prevUserData.userData.userPhones[key][0], phone: formattedValue}]
          }
      }
    }));

    // Updating 'edited' to indicate a specific field has been edited
    setEdited(prev => ({
        ...prev,
        phone: { ...prev.phone, [key]: true }
    }));
  };

  const handleInfoChange = (fieldKey, value) => {
      // Update local component state for immediate UI feedback
      setInfoData(prevInfoData => ({
          ...prevInfoData,
          [fieldKey]: value,
          displayName: fieldKey === 'firstName' ? `${value} ${prevInfoData.lastName}` :
                        fieldKey === 'lastName' ? `${prevInfoData.firstName} ${value}` : prevInfoData.displayName
  
      }));
  
      setUserData(prevUserData => {
          // Update the specific field and construct a new display name
          const updatedFirstName = fieldKey === 'firstName' ? value : prevUserData.userData.userInfo.firstName;
          const updatedLastName = fieldKey === 'lastName' ? value : prevUserData.userData.userInfo.lastName;
          const updatedDisplayName = `${updatedFirstName} ${updatedLastName}`;
  
          return {
              ...prevUserData,
              userData: {
                  ...prevUserData.userData,
                  userInfo: {
                      ...prevUserData.userData.userInfo,
                      firstName: updatedFirstName,
                      lastName: updatedLastName,
                      displayName: updatedDisplayName
                  }
              }
          };
      });
  
      // Updating 'edited' to indicate specific fields have been edited
      setEdited(prev => ({
          ...prev,
          userInfo: { ...prev.userInfo, [fieldKey]: true }
      }));
  };

  const handleInfoSubmit = (e) => {
    e.preventDefault();

    // Function to check if phone number matches the required format
    const isPhoneFormatCorrect = (phoneNumber) => {
        const phonePattern = /^\(\d{3}\) \d{3}-\d{4}$/;
        return phonePattern.test(phoneNumber);
    };

    let firstInvalidElement = null;
    let firstInvalidPanelId = null;

    // Check each phone number format
    Object.entries(phoneData).forEach(([key, phones]) => {
        phones.forEach((phoneDetail, index) => {
            if (!isPhoneFormatCorrect(phoneDetail.phone)) {
                // Format using the blur handler logic if not correct
                handlePhoneBlur(key, phoneDetail.phone);

                // After formatting, check again
                if (!isPhoneFormatCorrect(phoneDetail.phone)) {
                    // Find the input element that corresponds to this phone number
                    const phoneInput = document.querySelector(`input[name="phone"][data-key="${key}"][data-index="${index}"]`);
                    if (phoneInput && !firstInvalidElement) {
                        firstInvalidElement = phoneInput;
                        firstInvalidPanelId = `infoGroup-phone-${key}`;
                    }
                }
            }
        });
    });

    // If any invalid phone was found, focus and open the corresponding accordion
    if (firstInvalidElement) {
        // Check the radio button to open the accordion for the phone
        if (firstInvalidPanelId) {
            const accordionRadio = document.getElementById(`radio-${firstInvalidPanelId}`);
            if (accordionRadio) {
                accordionRadio.checked = true;
            }
        }
        setTimeout(() => {
            firstInvalidElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstInvalidElement.focus();
        }, 300);

        return; // Prevent form submission if there is an invalid input
    }

    // Proceed to find any other invalid input if no invalid phone found
    if (!firstInvalidElement) {
        const elements = e.target.elements;
        for (let i = 0; i < elements.length; i++) {
            if (elements[i].willValidate && !elements[i].validity.valid) {
                firstInvalidElement = elements[i];
                firstInvalidPanelId = firstInvalidElement.closest('.collapse')?.querySelector('input[type="radio"]')?.id;
                break;
            }
        }
    }

    if (firstInvalidElement && firstInvalidPanelId) {
        const accordionRadio = document.getElementById(firstInvalidPanelId);
        if (accordionRadio) {
            accordionRadio.checked = true; // Check the radio button to open the accordion
        }
        setTimeout(() => {
            firstInvalidElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstInvalidElement.focus();
        }, 300);

        return; // Prevent form submission if there is an invalid input
    }

    // Proceed with submission logic if all inputs are valid
    onSubmitInformation({
        userInfo: infoData,
        userAddress: addressData,
        userEmail: emailData,
        userPhones: phoneData
    }, edited);
  };

  const handleNewPhone = (e) => {
    console.log(`new phone clicked`)
  };

  const handleNewEmail = (e) => {
    console.log(`new email clicked`)
  };

  


  //FUNCTIONS
  const renderAccordion = () => {
    const details = [];
  
  // Render Info
  if (infoData) {
    details.unshift(
      <Card
        key="infoGroup-user-info"
        id="infoGroup-user-info"
        headerText="Name"
        headerHiddenText={{ Null: userData.userData.userInfo.displayName }}
        state={userData}
        setState={setUserData}
        setEdited
        defaultOpen={false}
        flex="col"
      >
        <CardInput
          label="First Name"
          type="text"
          id="firstName"
          childType="field"
          state={userData}
          setState={setUserData}
          stateKey="userData.userInfo.firstName"
        />
        <CardInput
          label="Last Name"
          type="text"
          id="lastName"
          childType="field"
          state={userData}
          setState={setUserData}
          stateKey="userData.userInfo.lastName"
        />
      </Card>
    );
  }
  
  // Render Address Information
  if (addressData) {
    details.push(
        <Card
            key="addressCard"
            id="address"
            headerText="Address"
            headerHiddenText={{}}
            state={userData}
            setState={setUserData}
            setEdited
            defaultOpen={true}
            flex="col"
        >
        {Object.entries(addressData).map(([type, addresses]) => addresses.map((address, index) => (
            <React.Fragment key={`${type}-${index}`}>
                <CardInput
                    label="Street"
                    type="text"
                    id={`street-${type}-${index}`}
                    childType="field"
                    state={userData}
                    setState={setUserData}
                    stateKey={`userData.userAddress.${type}[${index}].street`}
                />
                <CardInput
                    label="City"
                    type="text"
                    id={`city-${type}-${index}`}
                    childType="field"
                    state={userData}
                    setState={setUserData}
                    stateKey={`userData.userAddress.${type}[${index}].city`}
                />
                <CardInput
                    label="Province"
                    type="text"
                    id={`province-${type}-${index}`}
                    childType="field"
                    state={userData}
                    setState={setUserData}
                    stateKey={`userData.userAddress.${type}[${index}].province`}
                />
                <CardInput
                    label="Postal Code"
                    type="text"
                    id={`postalCode-${type}-${index}`}
                    childType="field"
                    state={userData}
                    setState={setUserData}
                    stateKey={`userData.userAddress.${type}[${index}].postalCode`}
                />
            </React.Fragment>
        )))}
    </Card>
    )
  };

  // Render Email Information
  if (emailData) {
    details.push(
        <Card
            key="email"
            id="email"
            headerText="Email"
            headerHiddenText={{}}
            state={userData}
            setState={setUserData}
            setEdited
            defaultOpen={false}
            onNew={handleNewEmail}
            flex="col"
        >
            {Object.entries(emailData).map(([key, emails]) => emails.map((emailDetail, index) => (
                <CardInput
                    key={`${key}-${index}`}
                    label={`${key.charAt(0).toUpperCase() + key.slice(1)} Email`}
                    type="email"
                    id={`email-${key}-${index}`}
                    childType="field"
                    state={userData}
                    setState={setUserData}
                    stateKey={`userData.userEmail.${key}[${index}].email`}
                    value={emailDetail.email}
                    onChange={(e) => handleEmailChange(key, e.target.value)}
                />
            )))}
        </Card>
    );
  }
  
  // Render Phone Information
  if (phoneData) {
    // Create a single Card for all phone inputs
    details.push(
      <Card
          key="phone-card"
          id="phone-card"
          headerText="Phone"
          headerHiddenText={{}}
          state={userData}
          setState={setUserData}
          setEdited
          defaultOpen={false}
          flex="col"
          onNew={handleNewPhone}
      >
          {Object.entries(phoneData).map(([key, phones]) => phones.map((phoneDetail, index) => (
              <CardInput
                  key={`${key}-${index}`}
                  label={`${key} Phone`}
                  type="tel"
                  id={`phone-${key}-${index}`}
                  childType="field"
                  state={userData}
                  setState={setUserData}
                  stateKey={`userData.userPhones.${key}[${index}].phone`}
                  value={formatNumber(phoneDetail.phone)}
                  onChange={(e) => handlePhoneChange(key, e.target.value)}
                  onBlur={(e) => handlePhoneBlur(key, e.target.value)}
                  placeholder="(123) 456-7890"
              />
          )))}
      </Card>
    );
  }

    return details;
  };


  //JSX
  return (
    <div className="flex flex-col items-center justify-center flex-grow">
      {renderAccordion()}
    </div>
  );                  
};

export default InformationCard;

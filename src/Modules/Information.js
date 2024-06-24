import React, { useState, useEffect } from 'react';
import { useUser } from '../UserContext.js';
import HeaderCard from '../UI Elements/HeaderCard';
import {Accordion} from '../UI Elements/Accordion.js';
import {IconButton} from '../UI Elements/Button';
import Card from '../UI Elements/Card.js';
import CardInput from '../UI Elements/CardInput.js';

const InformationCard = ({json, onSubmitInformation, edited, setEdited}) => {
    const { userData, setUserData } = useUser();
    const [infoData, setInfoData] = useState(userData.userData.userInfo);
    const [addressData, setAddressData] = useState(userData.userData.userAddress);
    const [emailData, setEmailData] = useState(userData.userData.userEmail);
    const [phoneData, setPhoneData] = useState(userData.userData.userPhones);

    useEffect(() => {
      if (!userData.userAddress) {
        setUserData((prevState) => ({
          ...prevState,
          userAddress: [],
        }));
      }
  
      Object.entries(addressData).forEach(([key, valueArray]) => {
        valueArray.forEach((index) => {
          if (!userData.userAddress[index]) {
            setUserData((prevState) => {
              const updatedUserAddress = [...prevState.userAddress];
              updatedUserAddress[index] = {};
              return {
                ...prevState,
                userAddress: updatedUserAddress,
              };
            });
          }
          if (!userData.userAddress[index][key]) {
            setUserData((prevState) => {
              const updatedUserAddress = [...prevState.userAddress];
              updatedUserAddress[index][key] = {};
              return {
                ...prevState,
                userAddress: updatedUserAddress,
              };
            });
          }
        });
      });
    }, [addressData, setUserData, userData]);

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
    
    const handlePhoneBlur = (key, value) => {
      function formatNumber(phoneNumber) {
          // Remove all non-digit characters from the string
          const cleanNumber = phoneNumber.replace(/\D/g, '');
      
          // Ensure only the last 10 digits are considered
          const lastTenDigits = cleanNumber.slice(-10);
      
          // Check if the number has exactly 10 digits, then format it
          if (lastTenDigits.length === 10) {
              return `(${lastTenDigits.slice(0, 3)}) ${lastTenDigits.slice(3, 6)}-${lastTenDigits.slice(6)}`;
          } else {
              // Return the original cleaned number if it doesn't have 10 digits
              return cleanNumber;
          }
      }
  
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
            defaultOpen={true}
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
            flex="col"
          >
            {Object.entries(addressData).flatMap(([key, valueArray]) =>
              valueArray.map((index) => {
                // Initialize nested objects if not already initialized
                if (!userData.userAddress[index]) {
                  setUserData(prevState => {
                    const updatedUserAddress = [...prevState.userAddress];
                    updatedUserAddress[index] = {};
                    return {
                      ...prevState,
                      userAddress: updatedUserAddress,
                    };
                  });
                }
                if (!userData.userAddress[index][key]) {
                  setUserData(prevState => {
                    const updatedUserAddress = [...prevState.userAddress];
                    updatedUserAddress[index][key] = {};
                    return {
                      ...prevState,
                      userAddress: updatedUserAddress,
                    };
                  });
                }
    
                return (
                  <React.Fragment key={`${key}-${index}`}>
                    <CardInput
                      label="Street"
                      type="text"
                      id={`street-${index}`}
                      childType="field"
                      state={userData}
                      setState={setUserData}
                      stateKey={`userAddress[${index}].${key}.street`}
                    />
                    <CardInput
                      label="City"
                      type="text"
                      id={`city-${index}`}
                      childType="field"
                      state={userData}
                      setState={setUserData}
                      stateKey={`userAddress[${index}].${key}.city`}
                    />
                    <CardInput
                      label="Province"
                      type="text"
                      id={`province-${index}`}
                      childType="field"
                      state={userData}
                      setState={setUserData}
                      stateKey={`userAddress[${index}].${key}.province`}
                    />
                    <CardInput
                      label="Postal Code"
                      type="text"
                      id={`postalCode-${index}`}
                      childType="field"
                      state={userData}
                      setState={setUserData}
                      stateKey={`userAddress[${index}].${key}.postalCode`}
                    />
                  </React.Fragment>
                );
              })
            )}
          </Card>
        );
      }
    
      // Render Email Information
      if (emailData) {
        Object.entries(emailData).forEach(([key, emails]) => {
          details.push(
            <Accordion
              key={`email-${key}`}
              name="infoGroup"
              id={`infoGroup-email-${key}`}
              headerText="Email"
              openState={false}
            >
              {emails.map((emailDetail, index) => (
                <div key={index} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={emailDetail.email}
                    onChange={(e) => handleEmailChange(key, e.target.value)}
                  />
                </div>
              ))}
            </Accordion>
          );
        });
      }
    
      // Render Phone Information
      if (phoneData) {
        Object.entries(phoneData).forEach(([key, phones]) => {
          details.push(
            <Accordion
              key={`phone-${key}`}
              name="infoGroup"
              id={`infoGroup-phone-${key}`}
              headerText="Phone"
              openState={false}
            >
              {phones.map((phoneDetail, index) => (
                <div key={index} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={phoneDetail.phone}
                    onChange={(e) => handlePhoneChange(key, e.target.value)}
                    onBlur={(e) => handlePhoneBlur(key, e.target.value)}
                    placeholder="(123) 456-7890"
                  />
                </div>
              ))}
            </Accordion>
          );
        });
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

import React, { useState } from 'react';
import { useUser } from '../UserContext.js';
import HeaderCard from '../UI Elements/HeaderCard';
import {Accordion} from '../UI Elements/Accordion.js';
import {IconButton} from '../UI Elements/Button';

const InformationCard = ({json, onSubmitInformation}) => {
    const { userData, setUserData } = useUser();
    const [infoData, setInfoData] = useState(userData.userData.userInfo);
    const [addressData, setAddressData] = useState(userData.userData.userAddress);
    const [emailData, setEmailData] = useState(userData.userData.userEmail);
    const [phoneData, setPhoneData] = useState(userData.userData.userPhones);
    const [edited, setEdited] = useState({});
    const headerTextStyle = {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '24px'
    };

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
        function formatToE164(phoneNumber) {
            // This is a simple formatter; for a more complex scenario consider using a library like libphonenumber-js
            const cleanNumber = phoneNumber.replace(/\D/g, ''); // Removes anything that is not a digit
            return `+1${cleanNumber}`; // Formats to E.164
        };
        setPhoneData(prev => {
            const updatedPhone = {...prev[key][0], phone: formatToE164(value)}; 
            return {
                ...prev,
                [key]: [updatedPhone]
            }
        });    
        // This step integrates the updated email data back into the global user context state
        setUserData(prevUserData => ({
            ...prevUserData,
            userData: {
                ...prevUserData.userData,
                userPhones: {
                    ...prevUserData.userData.userPhones,
                    [key]: [{...prevUserData.userData.userPhones[key][0], phone: formatToE164(value)}] // Update the email in the global state
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
        onSubmitInformation({userInfo: infoData,userAddress: addressData,userEmail: emailData,userPhones: phoneData}, edited);
    };

    //FUNCTIONS
    const renderAccordion = () => {
        const details = [];

        // Render Info
        // First, define an Accordion for user info (first and last name)
        if (infoData) {
            details.unshift(
                <Accordion
                    key="user-info"
                    name="infoGroup" 
                    headerText="Information"
                    openState={true}  // Set to open by default if desired
                >
                    <div className="space-y-4 p-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                            <input
                                type="text"
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                value={infoData.firstName}
                                onChange={(e) => handleInfoChange('firstName', e.target.value)}
                                placeholder="First Name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                            <input
                                type="text"
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                value={infoData.lastName}
                                onChange={(e) => handleInfoChange('lastName', e.target.value)}
                                placeholder="Last Name"
                            />
                        </div>
                    </div>
                </Accordion>
            );
        }

    
        // Render Address Information
        if (addressData) {
            Object.entries(addressData).forEach(([key, valueArray]) => {
                details.push(
                    <Accordion 
                        key={`address-${key}`} 
                        name="infoGroup" 
                        headerText={"Address"} 
                        openState={false}
                    >
                        {valueArray.map((addr, index) => (
                            <div key={index} className="space-y-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Street:</label>
                                    <input
                                        type="text"
                                        value={addr.street || ''}
                                        onChange={(e) => handleAddressChange(key, 'street', e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">City:</label>
                                    <input
                                        type="text"
                                        value={addr.city || ''}
                                        onChange={(e) => handleAddressChange(key, 'city', e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Province:</label>
                                    <input
                                        type="text"
                                        value={addr.province || ''}
                                        onChange={(e) => handleAddressChange(key, 'province', e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Postal Code:</label>
                                    <input
                                        type="text"
                                        value={addr.postalCode || ''}
                                        onChange={(e) => handleAddressChange(key, 'postalCode', e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            </div>
                        ))}
                    </Accordion>
                );
            });
        }
        
    
        // Render Email Information
        if (emailData) {
            Object.entries(emailData).forEach(([key, emails]) => {
                details.push(
                    <Accordion 
                        key={`email-${key}`} 
                        name="infoGroup" 
                        headerText={"Email"} 
                        openState={false}
                    >
                        {emails.map((emailDetail, index) => (
                            <div key={index} className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                                <input
                                    type="email"
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
                        headerText={"Phone"} 
                        openState={false}
                    >
                        {phones.map((phoneDetail, index) => (
                            <div key={index} className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                                <input
                                    type="tel"
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    value={phoneDetail.phone}
                                    onChange={(e) => handlePhoneChange(key, e.target.value)}
                                    pattern="^\(\d{3}\) \d{3}-\d{4}$"
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
        
        <HeaderCard headerText="Information" headerTextStyle={headerTextStyle}>
            <form onSubmit={handleInfoSubmit} className="flex flex-col justify-end gap-4 p-4 min-h-96">
                {renderAccordion()}
                <IconButton
                    className="btn btn-primary"
                    type="submit"
                    text="Update"
                />
            </form>
        </HeaderCard>
    );
};

export default InformationCard;

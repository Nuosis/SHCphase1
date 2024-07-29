import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext.js';
import { useWorkOrder, /*prepareWorkOrderData*/ } from '../WorkOrderContext.js';
import { useUser } from '../UserContext.js';
import { sanitizeInput, validateEmail, validatePhoneNumber } from '../Security/inputValidation.js';
import Popup from '../UI Elements/Popup.js';
import { createRecord } from '../FileMaker/createRecord.js';
import provinces from '../Environment/provinces.json';
import { IconButton } from '../UI Elements/Button';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function SignupPage() {
    const { createAuthUser, logIn, authState, setAuthState } = useAuth();
    const { workOrderData, setWorkOrderData, setNewWorkOrderData } = useWorkOrder();
    const { getUserData } = useUser();
    const [isCreatingAccount, setIsCreatingAccount] = useState(false);
    const [popup, setPopup] = useState({ show: false, message: '' });
    const [formFields, setFormFields] = useState({
        accountType: '',
        firstName: '',
        lastName: '',
        street: '',
        city: 'Victoria',
        province: 'BC',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
    });
    const navigate = useNavigate();
    const formToken = useQuery().get('form');

    useEffect(() => {
      async function fetchAndSetFormData() {
          if (formToken) {
              try {
                  const data = await detokenize(formToken);
                  if (!data) {
                      throw new Error("Form data fetch failed");
                  }
                  data.decoded.data.lineTotals = [
                    { description: data.decoded.data.activity, amount: data.decoded.data.price, hours: data.decoded.data.hours },
                    { description: 'GST', amount: data.decoded.data.price * 0.05 }
                  ];
                  console.log('decoded data',data)
                  setWorkOrderData(data.decoded.data);
                  setNewWorkOrderData(data.decoded.data); // Set newWorkOrderData as well
              } catch (error) {
                  console.error("Detokenization failed: ", error.message);
                  setPopup({ show: true, message: "Failed to load form data. Please try again." });
              }
          }
      }
      fetchAndSetFormData();
    }, [formToken, setWorkOrderData, setNewWorkOrderData]);

    async function detokenize(token) {
        try {
            const response = await fetch(`${authState.server}/getTokenData?token=${token}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Detokenization failed: ", error.message);
            setAuthState(prevState => ({
                ...prevState,
                errorMessage: error.message,
            }));
            throw error;
        }
    }

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormFields(prevFields => ({
            ...prevFields,
            [name]: value
        }));
    };

    const handleLoginSubmit = async (event) => {
      console.log("login initialized ...")
        event.preventDefault();
    
        const email = formFields.email;
        const password = formFields.password;
    
        try {
            const responseData = await logIn({ email, password });
            if (!responseData || !responseData.token) {
                throw new Error("Invalid login response");
            }
            setAuthState(prevState => ({
                ...prevState,
                userToken: responseData.token,
            }));
            const filemakerId = responseData.filemakerId
            const userDataInit = await getUserData(filemakerId)

            if (userDataInit.success !== true) {
                throw new Error("User data is not set. Check user context.");
            };

            const type = userDataInit.userData.userDetails.partyType[0].data

            if (type === 'Cleaner') {
              console.log('User type is cleaner');              
              setTimeout(() => navigate('/cleaner-portal'), 500);
            } else if (type === 'Provider') {
              console.log('User type is provider');              
              setTimeout(() => navigate('/provider-portal'), 500);
            } else {
              console.log('User type is customer');
              setTimeout(() => navigate('/customer-portal'), 500);
            }
            
        } catch (error) {
            console.error("Login or detokenization failed: ", error.message);
            setAuthState(prevState => ({
                ...prevState,
                errorMessage: error.message,
            }));
            setPopup({ show: true, message: `Login Failed. ${error.message}` });
            return
        }
    };

    const handleCreateAccount = async (event) => {
        console.log('handleCreateAccount')
        event.preventDefault();
    
        let sanitizedFormData = {};
        let isFormValid = true;
        let validationMessage = '';
        /**
         * FORM VALIDATION AND PREPERATION
         */
        //TODO: street validation
        for (const [key, value] of Object.entries(formFields)) {
            // Directly sanitize each input value
            let sanitizedValue = sanitizeInput(value);
    
            // Special handling for phoneNumber
            if (key === 'phoneNumber') {
                // Format the phone number before validation
                const formattedPhoneNumber = `+${sanitizedValue.replace(/\D/g, '')}`;
                if (!validatePhoneNumber(formattedPhoneNumber)) {
                    isFormValid = false;
                    validationMessage = "Invalid phone number format. Please enter a valid phone number.";
                    break;
                }
                sanitizedFormData[key] = formattedPhoneNumber; // Store the formatted, sanitized phone number
            } else {
                sanitizedFormData[key] = sanitizedValue;
            }
    
            // Email validation
            if (key === 'email' && !validateEmail(sanitizedValue)) {
                isFormValid = false;
                validationMessage = "Invalid email format. Please enter a valid email address.";
                break;
            }
    
            // Password match check
            if (key === 'password' && formFields.password !== formFields.confirmPassword) {
                console.log('password: ' ,formFields.password,'re-password: ' ,formFields.confirmPassword)
                isFormValid = false;
                validationMessage = "Passwords do not match. Please try again.";
                break;
            }
        }
    
        if (!isFormValid) {
            console.log('form is invalid')
            setPopup({ show: true, message: validationMessage });
            return;
        }

        /**
         * USER CREATATION
         */
    
        try {
            const success = await createAuthUser(sanitizedFormData);
            if (!success) {
                throw new Error(authState.errorMessage || "Failed to create account.");
            }
            console.log('User account created');
            // setPopup({ show: true, message: "Account created successfully!" });
        } catch (error) {
            console.log('User account creation failed');
            console.error(error);
            setPopup({ show: true, message: error.message || "Failed to create account." });
            return;
        }
    
        // create records in FileMaker
        //PARTY RECORD

        console.log("creating party in FileMaker")
        let partyResult = {}
        try {
            const params = {
                fieldData: {
                    displayName: `${sanitizedFormData.firstName} ${sanitizedFormData.lastName}`,
                    f_company: "0", // Assuming this is a constant for all new records
                    firstName: sanitizedFormData.firstName,
                    lastName: sanitizedFormData.lastName,
                }
            };
            const layout = "dapiParty"
            const returnRecord = true;
            partyResult = await createRecord(authState.token,params,layout,returnRecord);
            // console.log(partyResult) //remove in production
        } catch (error) {
            setPopup({ show: true, message: "Failed to create FileMaker Party account. Please try again." }); //remove in production
            return
        }

        // get party::__ID
        const partyID = partyResult.response.data[0].fieldData["__ID"]
        console.log("party created",partyID) //remove in production

        // create recordDetail record in FileMaker
        console.log("creating detail record in FileMaker")
        let detailResult = {}
        try {
            const params = {
                fieldData: {
                    data: sanitizedFormData.accountType,
                    type: "partyType",
                    "_fkID": partyID,
                }
            };
            const layout = "dapiRecordDetails"
            const recordReturn = false;
            detailResult = await createRecord(authState.token,params,layout, recordReturn);
            console.log(detailResult)
        } catch (error) {
            setPopup({ show: true, message: "Failed to create FileMaker Party account. Please try again." }); //remove in production
            return
        }
        console.log("email created")

        // create email record in FileMaker
        console.log("creating email in FileMaker")
        let emailResult = {}
        try {
            const params = {
                fieldData: {
                    email: sanitizedFormData.email,
                    label: "main",
                    f_primary: 1,
                    "_fkID": partyID,
                }
            };
            const layout = "dapiEmail"
            const emailReturn = false;
            emailResult = await createRecord(authState.token,params,layout, emailReturn);
            console.log(emailResult)
        } catch (error) {
            setPopup({ show: true, message: "Failed to create FileMaker Party account. Please try again." }); //remove in production
            return
        }
        console.log("email created")

        // create phone record in FileMaker
        console.log("creating phone in FileMaker")
        let phoneResult = {}
        try {
            const params = {
                fieldData: {
                    phone: sanitizedFormData.phoneNumber,
                    label: "main",
                    f_primary: 1,
                    f_sms: 1,
                    "_fkID": partyID,
                }
            };
            const layout = "dapiPhone"
            const phoneReturn = false;
            phoneResult = await createRecord(authState.token,params,layout, phoneReturn);
            console.log(phoneResult)
        } catch (error) {
            setPopup({ show: true, message: "Failed to create FileMaker Party account. Please try again." }); //remove in production
            return
        }
        console.log("phone created")

        // create address record in FileMaker
        console.log("creating address in FileMaker")
        let addressResult = {}
        try {
            const params = {
                fieldData: {
                    prov: sanitizedFormData.province,
                    city: sanitizedFormData.city,
                    streetAddress: sanitizedFormData.street,
                    type: "home",
                    "_fkID": partyID,
                }
            };
            const layout = "dapiAddress"
            const returnResult = false;
            addressResult = await createRecord(authState.token,params,layout, returnResult);
            console.log(addressResult)
        } catch (error) {
            setPopup({ show: true, message: "Failed to create FileMaker Party account. Please try again." }); //remove in production
            return
        }
        console.log("address created")

        // update AuthUser with FileMakerID
        console.log("Updating Auth User")
        const data = {newFileMakerID: partyID, userToken: authState.userToken}
        console.log({authState})
        try {       
            const response = await fetch(`${authState.server}/updateUser`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + authState.token,
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const responseData = await response.json();
            console.log('User Updated:', responseData);
        } catch (error) {
            console.error('Create User Error:', error);
            setAuthState(prevState => ({
                ...prevState,
                errorMessage: error.message,
            }));
            setPopup({ show: true, message: error.message || "Failed to update auth account with db ID." });
            return
        }

        setPopup({ show: true, message: "Account Created!" });
        
        //redirect user to customer portal
        //setTimeout(() => {  // Delay navigation
            navigate('/login');
        //}, 250); 
    };

    const handleIForgot = async (event) => {
      setPopup({ show: true, message: "Coming soon" });
      //confirm user email exists
      //trigger reset on node
    }

    const handleChangeForm = () => {
        setIsCreatingAccount(true);
    };

    //TODO: create consent to text flag. pop up if checked on creatation explaining sms usage. if user uncheck explain impact
    return (
      <>
        <div className="flex flex-col min-h-screen dark:bg-gray-800 bg-gray-100">
          <nav className="bg-white shadow-lg border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700  sticky top-0" style={{borderBottom: "1px solid rgba(156,163,175,0.25)"}}>
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-2">
              <a href="#" className="flex items-center py-2 px-2 text-gray-700 hover:text-gray-900">
                <img src="select-home-cleaning.png" className="max-h-12" alt="Select Home Cleaning"/>
              </a>
            </div>
          </nav>
          <div className="container mx-auto px-4 min-h-max flex-grow">
              {/* Overlay and POPUP */}
              {popup.show && (
                  <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50" style={{ zIndex: 30 }}>
                      <Popup message={popup.message} onClose={() => setPopup({ ...popup, show: false })} />
                  </div>
              )}
              {!isCreatingAccount ? (
                  <form className="max-w-md mx-auto bg-white shadow-lg rounded-lg dark:bg-gray-700" onSubmit={handleLoginSubmit}>
                    <h2 className="text-2xl font-bold max-w-md mx-auto text-primary dark:text-secondary my-8 px-8 pt-8">Welcome to Select Home Cleaning</h2>
                      {/* Login Form */}
                      <div className="form-control px-8 pb-4">
                          <label className="block text-sm font-bold text-primary dark:text-gray-400" htmlFor="email">
                              <span className="">Email</span>
                          </label>
                          <input type="email" id="email" name="email" className="input mt-2 input-bordered w-full text-black dark:bg-gray-600 dark:text-gray-400 dark:border-gray-700" placeholder="john@example.com" onChange={handleChange} required/>
                      </div>
                      <div className="form-control px-8 pb-4">
                          <label className="block text-sm font-bold text-primary dark:text-gray-400" htmlFor="password">
                              <span className="">Password</span>
                          </label>
                          <input type="password" id="password" name="password" className="input mt-2 input-bordered w-full text-black dark:bg-gray-600 dark:text-gray-400 dark:border-gray-700" placeholder="Enter your password" onChange={handleChange} required/>
                      </div>
                      <div className="form-control px-8 py-4">
                        <IconButton
                            icon="AccountCircle"
                            className="btn btn-primary"
                            type="submit"
                            text="Log In"
                        />
                          <div className="flex pt-8 pb-4">
                            <IconButton
                                icon="Edit"
                                className="btn dark:btn-outline dark:text-gray-500 btn-sm mr-4"
                                onClick={handleChangeForm}
                                type="button"
                                text="Create Account"
                            />
                            <IconButton
                                icon="Help"
                                className="btn dark:btn-outline dark:text-gray-500 btn-sm mr-4"
                                onClick={handleIForgot}
                                type="button"
                                text="Forgot Password"
                            />
                          </div>
                      </div>
                  </form>
              ) : (
                  <form className="max-w-md mx-auto bg-white shadow-lg rounded-lg dark:bg-gray-700" onSubmit={handleCreateAccount}>
                    <h2 className="text-2xl font-bold max-w-md mx-auto text-primary dark:text-secondary my-8 px-8 pt-8">Create Your {formFields.accountType} Account</h2>
                      {/* Sign Up Form */}
                      <div className="form-control px-8 pb-4">
                        <label className="label" htmlFor="accountType">
                          <span className="label-text">Account Type</span>
                        </label>
                        <select
                          id="accountType"
                          name="accountType"
                          className="input text-black input-bordered w-full dark:bg-gray-600 dark:text-gray-400 dark:border-gray-700"
                          onChange={handleChange}
                          value={formFields.accountType}
                          required
                        >
                          <option value="" disabled>Account Type...</option>
                          <option value="Customer">Customer</option>
                          <option value="Cleaner">Cleaner</option>
                          {/*<option value="Provider">Provider</option>*/}
                        </select>
                      </div>
                      <div className="form-control px-8 pb-4">
                        <label className="label" htmlFor="firstName">
                          <span className="label-text">First Name</span>
                        </label>
                        <input type="text" id="firstName" name="firstName" className="input text-black input-bordered w-full dark:bg-gray-600 dark:text-gray-400 dark:border-gray-700" placeholder="First Name..." onChange={handleChange} autoComplete="given-name" required />
                      </div>
                      <div className="form-control px-8 pb-4">
                        <label className="label" htmlFor="lastName">
                          <span className="label-text">Last Name</span>
                        </label>
                        <input type="text" id="lastName" name="lastName" className="input text-black input-bordered w-full dark:bg-gray-600 dark:text-gray-400 dark:border-gray-700" placeholder="Last Name..." onChange={handleChange} autoComplete="family-name" required />
                      </div>
                      <div className="form-control px-8 pb-4">
                        <label className="label" htmlFor="street">
                          <span className="label-text">Street Address</span>
                        </label>
                        <input type="text" id="street" name="street" className="input text-black input-bordered w-full dark:bg-gray-600 dark:text-gray-400 dark:border-gray-700" placeholder="123 4th St..." onChange={handleChange} autoComplete="street-address" required />
                      </div>
                      <div className="form-control px-8 flex flex-row">
                        <label className="label w-3/5 gap-2" htmlFor="city">
                          <span className="label-text">City</span>
                        </label>
                        <label className="label w-2/5 gap-2" htmlFor="province">
                          <span className="label-text">Province</span>
                        </label>
                      </div>
                      <div className="form-control px-8 pb-4 flex flex-row gap-2">
                        <input type="text" id="city" name="city" className="input text-black input-bordered w-3/5 dark:bg-gray-600 dark:text-gray-400 dark:border-gray-700" value={formFields.city} onChange={handleChange} autoComplete="address-level2" />
                        <select
                          id="province"
                          name="province"
                          className="input input-bordered w-2/5 text-black dark:bg-gray-600 dark:text-gray-400 dark:border-gray-700"
                          value={formFields.province}
                          onChange={handleChange}
                          autoComplete="address-level1"
                        >
                          {provinces.map((province) => (
                            <option key={province.code} value={province.code}>
                              {province.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-control px-8 pb-4">
                        <label className="label" htmlFor="email">
                          <span className="label-text">Email</span>
                        </label>
                        <input type="email" id="email" name="email" className="input text-black input-bordered w-full dark:bg-gray-600 dark:text-gray-400 dark:border-gray-700" placeholder="john@example.com" onChange={handleChange} autoComplete="email" required />
                      </div>
                      <div className="form-control px-8 pb-4">
                        <label className="label" htmlFor="phoneNumber">
                          <span className="label-text">Phone Number</span>
                        </label>
                        <input type="tel" id="phoneNumber" name="phoneNumber" className="input text-black input-bordered w-full dark:bg-gray-600 dark:text-gray-400 dark:border-gray-700" placeholder="(123) 456-7890" onChange={handleChange} autoComplete="tel" required />
                      </div>

                      <div className="form-control px-8 pb-4">
                          <label className="label" htmlFor="password">
                              <span className="label-text">Password</span>
                          </label>
                          <input type="password" id="password" name="password" className="input text-black input-bordered w-full dark:bg-gray-600 dark:text-gray-400 dark:border-gray-700" placeholder="Enter your password..." onChange={handleChange} required/>
                      </div>
                      <div className="form-control px-8 pb-4">
                          <label className="label" htmlFor="password">
                              <span className="label-text">Re-enter Password</span>
                          </label>
                          <input type="password" id="validation_password" name="confirmPassword" className="input input-bordered w-full dark:bg-gray-600 dark:text-gray-400 dark:border-gray-700" placeholder="Re-Enter your password..." onChange={handleChange} required/>
                      </div>
                      <div className="form-control px-8 pb-8 mt-6">
                          <button type="submit" className="btn btn-primary">Create Account</button>
                      </div>
                  </form>
              )}
          </div>
        </div>
      </>
    );
}

export default SignupPage;
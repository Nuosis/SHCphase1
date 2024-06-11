import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext.js';
import { useWorkOrder, prepareWorkOrderData } from '../WorkOrderContext.js';
import { useUser } from '../UserContext.js';
import { sanitizeInput, validateEmail, validatePhoneNumber } from './inputValidation.js';
import Popup from '../UI Elements/Popup.js';
import { createRecord } from '../FileMaker/createRecord.js';
import provinces from '../Environment/provinces.json';

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

            if (!userDataInit) {
                throw new Error("User data is not set. Check user context.");
            };

            // if (workOrderData && Object.keys(workOrderData).length > 0) {
            //     // setPopup({ show: true, message: "Login successful." });
            // } else {
            //     throw new Error("Work order data is not set. Check detokenization process.");
            // };
    
            setTimeout(() => navigate('/customer-portal'), 500);
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
                    data: "customer",
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
        console.log({data})
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

        if (workOrderData && Object.keys(workOrderData).length > 0) {
            setPopup({ show: true, message: "Account Created!" });
        } else {
            throw new Error("Work order data is not set. Check detokenization process.");
        }
        
        //redirect user to customer portal
        //setTimeout(() => {  // Delay navigation
            navigate('/login');
        //}, 250); 
    };

    const handleChangeForm = () => {
        setIsCreatingAccount(true);
    };

    //TODO: create consent to text flag. pop up if checked on creatation explaining sms usage. if user uncheck explain impact
    return (
        <div className="container mx-auto px-4">
            {/* Overlay and POPUP */}
            {popup.show && (
                <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50" style={{ zIndex: 30 }}>
                    <Popup message={popup.message} onClose={() => setPopup({ ...popup, show: false })} />
                </div>
            )}
            {/* HEADING */}
            <h2 className="text-2xl font-bold text-center my-8">{isCreatingAccount ? 'Create Your Account' : 'Welcome to Uber-Clean'}</h2>
            {!isCreatingAccount ? (
                <form className="space-y-4 max-w-md mx-auto" onSubmit={handleLoginSubmit}>

                    {/* Login Form */}

                    <div className="form-control">
                        <label className="label" htmlFor="email">
                            <span className="label-text">Email</span>
                        </label>
                        <input type="email" id="email" name="email" className="input input-bordered w-full" placeholder="john@example.com" onChange={handleChange} required/>
                    </div>
                    <div className="form-control">
                        <label className="label" htmlFor="password">
                            <span className="label-text">Password</span>
                        </label>
                        <input type="password" id="password" name="password" className="input input-bordered w-full" placeholder="Enter your password" onChange={handleChange} required/>
                    </div>
                    <div className="form-control mt-6">
                        <button type="submit" className="btn btn-primary">Log In</button>
                        <button type="button" onClick={handleChangeForm} className="text-right text-blue-500 hover:text-blue-700 transition duration-150 ease-in-out">Create account</button>
                    </div>
                </form>
            ) : (
                <form className="max-w-md mx-auto" onSubmit={handleCreateAccount}>

                    {/* Sign Up Form */}

                    <div className="form-control">
                        <label className="label" htmlFor="firstName">
                            <span className="label-text">First Name</span>
                        </label>
                        <input type="text" id="firstName" name="firstName" className="input input-bordered w-full" placeholder="Your" onChange={handleChange} required/>
                    </div>
                    <div className="form-control">
                        <label className="label" htmlFor="lastName">
                            <span className="label-text">Last Name</span>
                        </label>
                        <input type="text" id="lastName" name="lastName" className="input input-bordered w-full" placeholder="Name" onChange={handleChange} required/>
                    </div>
                    <div className="form-control">
                        <label className="label" htmlFor="street">
                            <span className="label-text">Street Address</span>
                        </label>
                        <input type="text" id="street" name="street" className="input input-bordered w-full"  placeholder="123 4th St" onChange={handleChange} required/>
                    </div>
                    <div className="form-control flex flex-row">
                        <label className="label w-3/5 gap-2" htmlFor="city">
                            <span className="label-text">City</span>
                        </label>
                        <label className="label  w-2/5 gap-2" htmlFor="province">
                            <span className="label-text">Province</span>
                        </label>
                    </div>
                    <div className="form-control flex flex-row gap-2">
                        <input type="text" id="city" name="city" className="input input-bordered w-3/5" value={formFields.city}  onChange={handleChange} />
                        <select 
                                id="province" 
                                name="province" 
                                className="input input-bordered w-2/5" 
                                value={formFields.province} 
                                onChange={handleChange}
                            >
                                {provinces.map((province) => (
                                    <option key={province.code} value={province.code}>
                                        {province.name}
                                    </option>
                                ))}
                        </select>
                    </div>
                    <div className="form-control">
                        <label className="label" htmlFor="email">
                            <span className="label-text">Email</span>
                        </label>
                        <input type="email" id="email" name="email" className="input input-bordered w-full" placeholder="john@example.com" onChange={handleChange} required/>
                    </div>
                    <div className="form-control">
                        <label className="label" htmlFor="phoneNumber">
                            <span className="label-text">Phone Number</span>
                        </label>
                        <input type="tel" id="phoneNumber" name="phoneNumber" className="input input-bordered w-full" placeholder="(123) 456-7890" onChange={handleChange} required />
                    </div>
                    <div className="form-control">
                        <label className="label" htmlFor="password">
                            <span className="label-text">Password</span>
                        </label>
                        <input type="password" id="password" name="password" className="input input-bordered w-full" placeholder="Enter your password" onChange={handleChange} required/>
                    </div>
                    <div className="form-control">
                        <label className="label" htmlFor="password">
                            <span className="label-text">Re-enter Password</span>
                        </label>
                        <input type="password" id="validation_password" name="confirmPassword" className="input input-bordered w-full" placeholder="Re-Enter your password" onChange={handleChange} required/>
                    </div>
                    <div className="form-control mt-6">
                        <button type="submit" className="btn btn-primary">Create Account</button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default SignupPage;
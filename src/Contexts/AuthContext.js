import React, { createContext, useContext, useState } from 'react';
import config from '../Environment/config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {

    const [authState, setAuthState] = useState({
        appToken: config.appToken,
        apiKey: config.apiKey,
        userToken: "",
        adminUserName: config.adminUserName,
        adminPassword: config.adminPassword,
        server: config.server,
        errorMessage: "", // For storing login errors
    });

    const logIn = async (formData) => {
        console.log("login called")
        const requestData = {
            username: formData.email,
            password: formData.password,
            apiKey: authState.apiKey,
        };
        // console.log("requestData: ",requestData)
        // console.log("serverURL: ",config.server)

        try {
            const response = await fetch(`${authState.server}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData),
            });
    
            if (!response.ok) {
                // If the response is not ok, throwing an error to be caught by the catch block
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const responseData = await response.json();
            console.log("Login success");
            return responseData
        } catch (error) {
            console.error("Login failed: ", error);
            // Update state with error message
            setAuthState(prevState => ({
                ...prevState,
                errorMessage: error.message,
            }));
        }
    }

    const createAuthUser = async (formData) => {
        console.log('creatingAuthUser')
        const data = {
            accessLevel: "Standard",
            newUserName: formData.email,
            newPassword: formData.password,
        };

        try {        
            const response = await fetch(`${config.server}/createUser`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + authState.appToken,
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const responseData = await response.json();
            console.log('User Created:');

            // Update state with the login data
            setAuthState(prevState => ({
                ...prevState,
                userToken: responseData.token,
                // token: responseData.token,
            }));
            return true; // Indicates success

        } catch (error) {
            console.error('Create User Error:', error);
            setAuthState(prevState => ({
                ...prevState,
                errorMessage: error.message,
            }));
            return false;
        }
    };

    // You can also define logOut,etc., here

    return (
        <AuthContext.Provider value={{ authState, setAuthState, logIn, createAuthUser }}>
            {children}
        </AuthContext.Provider>
    );
};
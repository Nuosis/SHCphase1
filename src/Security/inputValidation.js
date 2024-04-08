// Utility function to sanitize input
export const sanitizeInput = (input) => {
    // Use a library or implement a sanitization logic here
    // For demonstration, a simple replace function that escapes HTML characters
    return input.replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
};

// Function to validate email format
export const validateEmail = (email) => {
    // Regex pattern for validating email
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

// Function to validate phone number format (simple example, adjust regex as needed)
export const validatePhoneNumber = (phoneNumber) => {
    // Regex pattern for a simple phone number validation
    const re = /^\d{10}$/;
    return re.test(String(phoneNumber).replace(/\D/g, ''));
};

// Add more validation functions as needed...

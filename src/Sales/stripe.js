// stripe.js

/**
 * Function to call the Stripe-related backend endpoint with necessary parameters.
 *
 * @param {string} method - The Stripe method to be called on the server.
 * @param {Object} params - The parameters for the Stripe method.
 * @param {string} token - The appToken for authentication from authUser.
 * @returns {Promise<Object>} The JSON response from the Stripe operation.
 */

async function callStripeApi(token, method, params) {
  try {
      const response = await fetch('https://server.claritybusinesssolutions.ca:4343/stripe', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              // Assuming the API key is sent as a bearer token; adjust if your auth setup differs
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ method, params })
      });

      if (!response.ok) {
          throw new Error(`HTTP status ${response.status}`);
      }

      const data = await response.json();
      return data;
  } catch (error) {
      console.error('Error calling custom Stripe API:', error);
      throw error;
  }
}

export { callStripeApi };

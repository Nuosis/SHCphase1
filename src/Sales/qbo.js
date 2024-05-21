// stripe.js

/**
 * Function to call the Stripe-related backend endpoint with necessary parameters.
 *
 * @param {string} method - The Stripe method to be called on the server.
 * @param {Object} params - The parameters for the Stripe method.
 * @param {string} token - The appToken for authentication from authUser.
 * @returns {Promise<Object>} The JSON response from the Stripe operation.
 */

async function callQBOApi(token, method, params) {
  try {
      const response = await fetch('https://server.claritybusinesssolutions.ca:4343/qbo', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
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
      console.error('Error calling custom QBO API:', error);
      throw error;
  }
}

export { callQBOApi };

/**
 * METHODS
 *    queryQBO(qbo, params.tableName, params.whereClause);
      createInvoice(qbo, createInvoiceData(params.customerId, params.txnDate, params.lineItems, params.currencyCode));
      getInvoice(qbo, params.invoiceId);
      updateInvoice(qbo, params.invoiceId, params.invoiceData);
      createBill(qbo, createBillData(params.vendorId, params.txnDate, params.dueDate, params.lineItems, params.currencyCode));
      getBill(qbo, params.billId);
      updateBill(qbo, params.billId, params.billData);
      getCustomer(qbo, params.customerId);
      createCustomer(qbo, params.customerData);
      updateCustomer(qbo, params.customerId, params.customerData);
 * 
 * 
 * 
 * CUSTOMER DATA
 * 
 * 
let customerData = {
    // Required Fields
    DisplayName: "Customer's Display Name",

    // Common Fields
    Title: "Mr.",                // or "Ms.", "Dr.", etc.
    GivenName: "John",           // First Name
    FamilyName: "Doe",           // Last Name
    Suffix: "Jr.",               // e.g., "Sr.", "Jr."
    FullyQualifiedName: "John Q. Doe",  // Usually "DisplayName" but can be a full name

    // Company Name (if applicable)
    CompanyName: "Doe's Fresh Produce",

    // Contact Details
    PrimaryPhone: {
        FreeFormNumber: "(555) 123-4567"
    },
    Mobile: {
        FreeFormNumber: "(555) 234-5678"
    },
    PrimaryEmailAddr: {
        Address: "john.doe@example.com"
    },

    // Address Information
    BillAddr: {
        Line1: "123 Main Street",
        Line2: "Apartment 4A",
        City: "Hometown",
        Country: "USA",
        CountrySubDivisionCode: "CA",  // e.g., State (like 'CA' for California)
        PostalCode: "12345"
    },
    ShipAddr: {
        Line1: "123 Main Street",
        Line2: "Apartment 4A",
        City: "Hometown",
        Country: "USA",
        CountrySubDivisionCode: "CA",  // e.g., State (like 'CA' for California)
        PostalCode: "12345"
    },

    // Additional Info
    Notes: "Important customer, handle with care",
    WebAddr: {
        URI: "http://www.johndoe.com"
    },

    // Tax Information
    Taxable: true,
    DefaultTaxCodeRef: {
        value: "GST"
    },

    // Customer Type, Terms, and Sales Information
    CustomerTypeRef: {
        value: "5"  // Reference to the customer type in your QBO setup
    },
    SalesTermRef: {
        value: "3"  // Reference to the sales terms in your QBO setup
    },
    PreferredDeliveryMethod: "Email",
    CurrencyRef: {
        value: "CAD"
    }
};
 *
 *
 * LINE OBJECT
 *
 * 
    const lineItems = [
        {
            description: "Consulting services",
            amount: 300.00,
            itemId: "1",
            quantity: 15,
            unitPrice: 20,
            taxCodeRef: "NON"
        },
        {
            description: "Software subscription",
            amount: 500.00,
            itemId: "2",
            quantity: 10,
            unitPrice: 50,
            taxCodeRef: "TAX"
        }
    ]; 
 */
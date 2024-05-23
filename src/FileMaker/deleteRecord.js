

async function deleteRecord(token, layout, recordID) {

    console.log("FileMaker_deleteRecord called")
    // Prepare the data for the API call
    const payloadData = {
        method: "deleteRecord",
        server: "server.selectjanitorial.com",
        database: "clarityData",
        layout,
        recordId: recordID,
    };

    try {
        const response = await fetch('https://server.claritybusinesssolutions.ca:4343/clarityData', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(payloadData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();

        // Check if the response indicates success
        if (responseData.messages && responseData.messages[0].code === "0") {
            console.log("Record deleted successfully", responseData.response);
            return responseData
        } else {
            throw new Error(`Failed to create record: ${responseData.messages[0].message}`);
        }
    } catch (error) {
        console.error("Error creating account: ", error.message);
        throw error; // Rethrow the error to be handled by the caller
    }
}

export { deleteRecord };

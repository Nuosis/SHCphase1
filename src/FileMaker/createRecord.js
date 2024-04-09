import {updateRecord} from './updateRecord'

async function createRecord(token, params, layout) {
    // Prepare the data for the API call
    let data = {};
    const partyData = {
        method: "createRecord",
        server: "server.selectjanitorial.com",
        database: "clarityData",
        layout,
        params
    };

    try {
        const response = await fetch('https://server.claritybusinesssolutions.ca:4343/clarityData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(partyData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();

        // Check if the response indicates success
        if (responseData.messages && responseData.messages[0].code === "0") {
            console.log("Record created successfully", responseData.response);
            const recordID = responseData.response.recordId;
            const params = {fieldData: {"~dapiRecordID": `${recordID} `}}
            data = {params,recordID}

            const updateData = await updateRecord(token, data, layout)

            if (updateData.messages && updateData.messages[0].code === "0") {
                console.log("Party record updated successfully", updateData.response);
            } else {
                throw new Error(`Failed to update record: ${updateData.messages[0].message}`);
            }
            return {responseData}
        } else {
            throw new Error(`Failed to create record: ${responseData.messages[0].message}`);
        }


    } catch (error) {
        console.error("Error creating account: ", error.message);
        throw error; // Rethrow the error to be handled by the caller
    }
}

            // update party.~dapiRecordID in FileMaker with reported recordID

export { createRecord };

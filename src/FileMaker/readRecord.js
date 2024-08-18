

async function readRecord(token, params, layout) {
    console.log("FileMaker Read called")    
    
    // Check if params is an array and not an object with a 'query' property
    if (Array.isArray(params) && !params.query) {
        params = { query: params };
    }
    
    // Prepare the data for the API call
    const payloadData = {
        method: "findRecord",
        server: "server.claritybusinesssolutions.ca",
        database: "clarityData",
        layout,
        params
    };
    //console.log({payloadData})


    const response = await fetch('https://server.claritybusinesssolutions.ca:4343/clarityData', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payloadData),
    });

    const responseData = await response.json();
    // console.log("read response data: ",{responseData})
    return responseData

    // Check if the response indicates success
    // if (responseData.messages && responseData.messages[0].code === "0" ) {
    //     return responseData
    // } else if (responseData.messages && responseData.messages[0].code === "401" ) {
    //   return responseData
    // } else {
    //     throw new Error(`Failed to find record: ${responseData.messages[0].message}`);
    // }
}

export { readRecord };

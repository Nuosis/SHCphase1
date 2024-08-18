import { readRecord } from '../../FileMaker/readRecord.js';

export     async function createConversationObject(userObject,authState) {
  console.log("conversation fetch called ...")
  //GET MEMEBRSHIP INFO FROM CONVO OBJ
  const layout = "dapiConversationsObject"
  const memberQuery = [
      {"dapiConversationMembers::_memberID": userObject[0].fieldData["__ID"]}
  ];
  const conversations = [];

  const conversationObject = await readRecord(authState.userToken,{query: memberQuery},layout)
  console.log(conversationObject)
  if(conversationObject.error){
    console.error("Error on getting conversation info from FileMaker")
    return conversations
  }
  const data = conversationObject.response.data
  // console.log("conversation data",{data},{conversationObject})

  data.forEach(record => {
    const { fieldData, portalData } = record;
    
    // Check if the record is active
    if (fieldData.f_active !== 0 ) {  // Assuming f_active is a string
        const conversation = {
            id: fieldData.__ID,
            recordID: fieldData["~dapiRecordID"],
            members: []
        };

        // Extract members if they exist in portalData
        if (portalData && portalData.dapiConversationMembers) {
            portalData.dapiConversationMembers.forEach(member => {
              if(member[`dapiConversationMembers::_memberID`] !==userObject[0].fieldData["__ID"]){
                conversation.members.push({
                    memberId: member["dapiConversationMembers::_memberID"],
                    memberName: member["dapiConversationMembers::memberName"]
                });
              }
            });
        }

        // Push the filled conversation object into the conversations array
        conversations.push(conversation);
    }
});

  return conversations
};
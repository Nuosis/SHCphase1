import React, { useState, useEffect } from 'react';
import HeaderCard from '../UI Elements/HeaderCard';
import { RoundButton } from '../UI Elements/Button';
import ChatWindow from '../UI Elements/ChatWindow.js';
import { readRecord } from '../FileMaker/readRecord.js';
import { createRecord } from '../FileMaker/createRecord.js';
import { updateRecord } from '../FileMaker/updateRecord.js';
import { useAuth } from '../AuthContext.js';


// const messages = [
//   {
//     name: 'Alana',
//     timeText: 'Jun 16 10:00 AM',
//     chatText: 'Just checking in and letting you know I am done!',
//     status: 'sent',
//     sendDirection: 'in'
//   },
//   {
//     name: 'Marcus',
//     timeText: 'Jun 16 10:05 AM',
//     chatText: 'Great! See you next week.',
//     status: 'read',
//     sendDirection: 'out'
//   }
// ];


const CommunicationPortal = ({userData}) => {
  const [ messages, setMessages ] = useState([]);
  const [ isMessaging, setIsMessaging] = useState({}) // is {id, members[{id, name}]} of the conversation
  const { authState } = useAuth();
  const [, setForceRender] = useState(0); // State to force re-render

  //INITIALIZATIONS
  const userConversations = userData.userData.userConversations
  console.log({userConversations}, {userData})

  //HANDLERS

  const handleSubmitMessage = async (message) => {
    console.log('Message:', message);
    const convoID = isMessaging.id
    const convoMembers = isMessaging.members //[{id,name}]
    const senderID = userData.userData.userInfo.metaData.ID

    //CONSTRUCT MESSAGES OBJ
    let fieldData = {
      "_conversationID": convoID,
      "_senderID": senderID,
      message,
      status: "sent"
    }
    let params = {fieldData}
    let layout = "dapiMessageObject"
    let result

    // create message record
    try {
      console.log("Calling CreateRecord ...")
      result = await createRecord(authState.token, params, layout, true);
    } catch (error) {
      console.error("Error creating record:", error.message);
      throw new Error(`Failed to create message record in FileMaker: ${error.message}`);
    }
    const messageRecord = result
    console.log('createRecordResult', messageRecord)
    const messageID = messageRecord.response.data[0].fieldData["__ID"]

    // CONSTRUCT STATUS RECORD FOR EACH MEMEBER NOT USER
    convoMembers.forEach(member => {
      console.log({member})
      const text = {
        type: "message",
        sender: userData.userData.userInfo.displayName,
        recipient: member.name
      }
      fieldData = {
        "_parentFkID": messageID,
        "_relatedFkID": member.id,
        text: JSON.stringify(text),
        status: "delivered"
      }
      params = {fieldData}
      layout = "dapiStatus"
      // create message record
      createRecord(authState.token, params, layout, false)
    })
  };

  const handleGetMessages = async (id) => {
    try {
      // GET MESSAGES OBJ
      const layout = "dapiMessageObject";
      const query = [
          {"dapiMessageConversation::__ID": id }
      ];
  
      const messagesObject = await readRecord(authState.token, {query}, layout);
      if (messagesObject.response.data.length === 0) {
        throw new Error("Error on getting message info from FileMaker");
      }
      const data = messagesObject.response.data;
      console.log({data})
      const messages = constructMessageObj(data);
      console.log({messages});
      setMessages(messages);
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
    // Force re-render
    setForceRender(value => value + 1);
  }
  
  const handleLoadMessages = async (id) => {
    if (id !== isMessaging.id) {
      const conversation = userConversations.find(convo => convo.id === id);
  
      if (conversation) {
        const conversationObj = {
          id: conversation.id,
          members: conversation.members.map(member => ({
            id: member.memberId,
            name: member.memberName
          }))
        };
        setIsMessaging(conversationObj);
        await handleGetMessages(id);
      } else {
        console.error('Conversation not found for id:', id);
      }
    }
  };
  
  
  //FUNCTIONS
  const constructMessageObj = (data) => {
    if(!Array.isArray(data)){
      throw new Error("data passed needs to be an array") 
    }
    
    data.forEach(item => {
      // Extracting name and timeText from each item
      const message = {}
      const sendDirection = item.fieldData['_senderID']===userData.userData.userInfo.metaData.ID?'out':'in'
      const status = item.portalData && item.portalData.dapiMessageStatus && item.portalData.dapiMessageStatus.length > 0
      ? item.portalData.dapiMessageStatus[item.portalData.dapiMessageStatus.length - 1]
      : {};
      const currentStatus = status["dapiMessageStatus::status"]
      //console.log({status})
      const statusInfo = JSON.parse(status["dapiMessageStatus::text"])
      message.status = sendDirection==='in'?'read':currentStatus;
      message.statusRecordID = status["dapiMessageStatus::~dapiRecordID"];
      message.name = statusInfo.sender.split(' ')[0] || "" ;
      message.timeText = formatTimestamp(item.fieldData["~CreationTimestamp"]);
      message.chatText = item.fieldData.message;
      message.senderID = item.fieldData['_senderID'];
      message.fmID = item.fieldData['__ID'];
      message.sendDirection = sendDirection
      messages.push(message);

      // update status record if sendDirection is "in" and status is "delivered"
      if(message.sendDirection==="in" && currentStatus==="delivered"){
        //UPDATE STATUS RECORD
        const fieldData = {
          status: "read"
        }
        const recordID = message.statusRecordID
        const params = {fieldData}
        const layout = "dapiStatus"
        // create message record
        updateRecord(authState.token, params, layout, recordID)
      }
    })
    console.log({messages})
    return messages
  }

  function formatTimestamp(timestamp) {
    // Create a date object from the timestamp
    const date = new Date(timestamp);

    // Define options for toLocaleString to format the date
    const options = {
        month: 'short', // Abbreviated month
        day: '2-digit', // Two-digit day
        hour: 'numeric', // Numeric hour
        minute: '2-digit', // Two-digit minute
        hour12: true // Use 12-hour format
    };

    // Return the formatted date string
    return date.toLocaleString('en-US', options);
  }

  const sendMessage = (message) => {
    // massage{ name,timeText,chatText,sendDirection,status }
    console.log("sendMessage called ...")
    setMessages(prevMessages => [...prevMessages, message]);//this updates the messages object and display result 
    // Force re-render
    setForceRender(value => value + 1);
    handleSubmitMessage(message.chatText) // this creates the message record in DB
  }

  const getName = (name) => {
    if(Array.isArray(name)){
      if (name.length > 1) {
        return "multiMember";
      } else if (name.length === 1) {
        return name[0].memberName; // Assuming the array contains objects with a 'memberName' property
      } else {
        return "?"; // Handle the case where the array is empty
      }
    } else {
      return name
    }
  }


  //VARIABLES

  return(
    <div id="communication card" className="flex flex-grow items-stretch justify-center flex-grow">
      <HeaderCard headerText="Message Centre">
        <div id="communication panes wrapper" className="flex flex-row gap-4 my-4">
          <div id="conversation icons" className="flex flex-col gap-4 mt-2 p-2 w-1/12 items-center">
            {userConversations.map((conversation, index) => (
              <RoundButton
                key={index}
                id={conversation.id}
                onClick={() => handleLoadMessages(conversation.id)}
                name={getName(conversation.members)}
                image={null} // Ensure 'image' is a proper URL or `null` if not provided
              />
            ))}
          </div>
          <div id="chatContainer" className="w-11/12 h-min-full">
            {messages && messages.length !== 0 ? (
              <>
                <div className="text-2xl font-bold text-primary pr-8 py-4 dark:text-secondary">Alana</div>
                <ChatWindow messages={messages} onSendMessage={sendMessage} userData={userData} />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center"></div>
            )}
          </div>
        </div>
      </HeaderCard>
    </div>
  )

}

export default CommunicationPortal;
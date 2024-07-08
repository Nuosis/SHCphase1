import React, { useState } from 'react';
import HeaderCard from '../UI Elements/HeaderCard';
import { RoundButton } from '../UI Elements/Button';
import ChatWindow from '../UI Elements/ChatWindow.js';
import { readRecord } from '../FileMaker/readRecord.js';
import { useAuth } from '../AuthContext.js';


const messages = [
  {
    name: 'Alana',
    timeText: 'Jun 16 10:00 AM',
    chatText: 'Just checking in and letting you know I am done!',
    status: 'sent',
    sendDirection: 'in'
  },
  {
    name: 'Marcus',
    timeText: 'Jun 16 10:05 AM',
    chatText: 'Great! See you next week.',
    status: 'read',
    sendDirection: 'out'
  }
];

const CommunicationPortal = ({userData}, {onSubmitMessage}) => {
  const [ userMessage, setUserMessage ] = useState("");
  const [ isMessaging, setIsMessaging] = useState("") // is the id of the recipient
  const { authState } = useAuth();

  //INITIALIZATIONS
  const userConversations = userData.userData.userConversations
  // console.log({userConversations}, {userData})

  //HANDLERS
  const handleLoadMessages = async (id) => {
    setIsMessaging(id)
    //GET MESSAGES OBJ
    const layout = "dapiMessageObject"
    const query = [
        {"dapiMessageConversation::__ID": id }
    ];

    const messagesObject = await readRecord(authState.token,{query},layout)
    if(messagesObject.length===0){
        throw new Error("Error on getting message info from FileMaker")
    }
    const data = messagesObject.response.data
    console.log({data})
    const messages = constructMessageObj(data)
    console.log({messages})
    setUserMessage(messages)
  }
  
  //FUNCTIONS
  const constructMessageObj = (data) => {
    if(!Array.isArray(data)){
      throw new Error("data passed needs to be an array") 
    }
    let messages = [];
    data.forEach(item => {
      // Extracting name and timeText from each item
      const message = {}
      const status = item.portalData && item.portalData.dapiMessageStatus && item.portalData.dapiMessageStatus.length > 0
      ? item.portalData.dapiMessageStatus[item.portalData.dapiMessageStatus.length - 1]
      : {};
      //console.log({status})
      const statusInfo = JSON.parse(status["dapiMessageStatus::text"])
      message.status = status["dapiMessageStatus::status"] || "unknown" ;
      message.name = statusInfo.sender.split(' ')[0] || "" ;
      message.timeText = formatTimestamp(item.fieldData["~CreationTimestamp"]);
      message.chatText = item.fieldData.message;
      message.sendDirection = item.fieldData['_senderID']===userData.userData.userInfo.metaData.ID?'out':'in'
      messages.push(message);
    })
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
    //filter userMessage by cleanerID or orgID
    setUserMessage(messages.push(message))
    onSubmitMessage(message)
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
    <div id="communication card" className="flex flex-col items-center justify-center flex-grow">
      <HeaderCard>
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
            {userMessage && userMessage !== "" && (
              <>
                <div className="text-2xl font-bold text-primary pr-8 py-4 dark:text-secondary">Alana</div>
                <ChatWindow messages={userMessage} onSendMessage={sendMessage} userData={userData} />
              </>
            )}
          </div>
        </div>
      </HeaderCard>
    </div>
  )

}

export default CommunicationPortal;
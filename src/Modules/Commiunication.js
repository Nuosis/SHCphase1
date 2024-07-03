import React, { useState } from 'react';
import { useUser } from '../UserContext.js';
import HeaderCard from '../UI Elements/HeaderCard';
import { IconButton } from '../UI Elements/Button';
import ChatWindow from '../UI Elements/ChatWindow.js';
import 'daisyui';


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

const CommunicationPortal = ({onSubmitMessage}) => {
  const { userData, setUserData } = useUser();
  const [ userMessage, setUserMessage ] = useState(messages);
  const [ isMessaging, setIsMessaging] = useState("") // is the id of the recipient
  //INITIALIZATIONS
  //HANDLERS
  //FUNCTIONS
  const loadMessage = (type) => {
    //filter userMessage by cleanerID or orgID
    setIsMessaging("cleanerID")
  }

  const sendMessage = (message) => {
    //filter userMessage by cleanerID or orgID
    setUserMessage(messages.push(message))
    onSubmitMessage(message)
  }


  //VARIABLES
  const headerTextStyle = {

  };

  return(
    <div className="flex flex-col items-center justify-center flex-grow">
      <HeaderCard headerText="Communication" headerTextStyle={headerTextStyle} >
        <div className="flex flex-row gap-4 mb-4">
          <IconButton
            icon="Person"
            className="btn btn-primary"
            onClick={() => loadMessage("cleaner")}
            type="Button"
            text="Message Cleaner"
          />
          <IconButton
            icon="Business"
            className="btn btn-outline dark:btn-outline dark:text-gray-500"
            onClick={() => loadMessage("company")}
            type="Button"
            text="Message Select"
          />
        </div>
        <container id="chatContainer">
          <ChatWindow messages={messages} onSendMessage={sendMessage} userData={userData} />
        </container>
      </HeaderCard>
    </div>
  )

}

export default CommunicationPortal;
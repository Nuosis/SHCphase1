import React, { useState, useEffect, useRef } from 'react';
import HeaderCard from '../UI Elements/HeaderCard';
import ChatWindow from '../UI Elements/ChatWindow.js';
import { readRecord } from '../FileMaker/readRecord.js';
import { createRecord } from '../FileMaker/createRecord.js';
import { updateRecord } from '../FileMaker/updateRecord.js';
import { useAuth } from '../AuthContext.js';

const CommunicationPortal = ({ userData }) => {
  const [messages, setMessages] = useState([]);
  const [isMessaging, setIsMessaging] = useState(null);
  const [selectedConversationId, setSelectedConversationId] = useState(null); // Track selected conversation ID
  const [showChatPanel, setShowChatPanel] = useState(false); // Track visibility of chat panel
  const { authState } = useAuth();
  const [, setForceRender] = useState(0); 
  const lastMessageRef = useRef(null); // Ref for the last message

  const userConversations = userData.userData.userConversations;
  console.log({ userConversations }, { userData });

  const handleSubmitMessage = async (message) => {
    console.log('Message:', message);
    const convoID = isMessaging.id;
    const convoMembers = isMessaging.members;
    const senderID = userData.userData.userInfo.metaData.ID;

    let fieldData = {
      "_conversationID": convoID,
      "_senderID": senderID,
      message,
      status: "sent"
    };
    let params = { fieldData };
    let layout = "dapiMessageObject";
    let result;

    try {
      console.log("Calling CreateRecord ...");
      result = await createRecord(authState.token, params, layout, true);
    } catch (error) {
      console.error("Error creating record:", error.message);
      throw new Error(`Failed to create message record in FileMaker: ${error.message}`);
    }
    const messageRecord = result;
    console.log('createRecordResult', messageRecord);
    const messageID = messageRecord.response.data[0].fieldData["__ID"];

    convoMembers.forEach(member => {
      console.log({ member });
      const text = {
        type: "message",
        sender: userData.userData.userInfo.displayName,
        recipient: member.name
      };
      fieldData = {
        "_parentFkID": messageID,
        "_relatedFkID": member.id,
        text: JSON.stringify(text),
        status: "delivered"
      };
      params = { fieldData };
      layout = "dapiStatus";
      createRecord(authState.token, params, layout, false);
    });
  };

  const handleGetMessages = async (id) => {
    try {
      const layout = "dapiMessageObject";
      const query = [{ "dapiMessageConversation::__ID": id }];
  
      const messagesObject = await readRecord(authState.token, { query }, layout);
      if (messagesObject.response.data.length === 0) {
        throw new Error("Error on getting message info from FileMaker");
      }
      const data = messagesObject.response.data;
      console.log({ data });
      const messages = constructMessageObj(data);
      console.log({ messages });
      setMessages(messages);
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
    setForceRender(value => value + 1);
  };
  
  const handleLoadMessages = async (id) => {
    if (id === selectedConversationId) {
      // Toggle visibility of the chat panel
      setShowChatPanel(!showChatPanel);
      // Deselect conversation if the panel is hidden
      if (showChatPanel) {
        setSelectedConversationId(null);
      }
    } else {
      // Load new conversation
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
        setSelectedConversationId(id); // Set the selected conversation ID
        setShowChatPanel(true); // Ensure chat panel is shown when a new conversation is selected
        await handleGetMessages(id);
      } else {
        console.error('Conversation not found for id:', id);
      }
    }
  };
  
  const constructMessageObj = (data) => {
    if(!Array.isArray(data)){
      throw new Error("data passed needs to be an array"); 
    }
    
    const messages = [];
    data.forEach(item => {
      const message = {};
      const sendDirection = item.fieldData['_senderID'] === userData.userData.userInfo.metaData.ID ? 'out' : 'in';
      const status = item.portalData && item.portalData.dapiMessageStatus && item.portalData.dapiMessageStatus.length > 0
        ? item.portalData.dapiMessageStatus[item.portalData.dapiMessageStatus.length - 1]
        : {};
      const currentStatus = status["dapiMessageStatus::status"];
      const statusInfo = JSON.parse(status["dapiMessageStatus::text"]);
      message.status = sendDirection === 'in' ? 'read' : currentStatus;
      message.statusRecordID = status["dapiMessageStatus::~dapiRecordID"];
      message.name = statusInfo.sender.split(' ')[0] || "" ;
      message.timeText = formatTimestamp(item.fieldData["~CreationTimestamp"]);
      message.chatText = item.fieldData.message;
      message.senderID = item.fieldData['_senderID'];
      message.fmID = item.fieldData['__ID'];
      message.sendDirection = sendDirection;
      messages.push(message);

      if (message.sendDirection === "in" && currentStatus === "delivered") {
        const fieldData = {
          status: "read"
        };
        const recordID = message.statusRecordID;
        const params = { fieldData };
        const layout = "dapiStatus";
        updateRecord(authState.token, params, layout, recordID);
      }
    });
    console.log({ messages });
    return messages;
  };

  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);

    const options = {
        month: 'short',
        day: '2-digit',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    };

    return date.toLocaleString('en-US', options);
  }

  const sendMessage = (message) => {
    console.log("sendMessage called ...");
    setMessages(prevMessages => [...prevMessages, message]);
    setForceRender(value => value + 1);
    handleSubmitMessage(message.chatText);
  };

  const getName = (name) => {
    if(Array.isArray(name)){
      if (name.length > 1) {
        return "multiMember";
      } else if (name.length === 1) {
        return name[0].memberName; 
      } else {
        return "?"; 
      }
    } else {
      return name;
    }
  };

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]); // Trigger this effect whenever `messages` changes

  return (
    <div className="flex flex-grow items-stretch justify-center flex-grow">
      <HeaderCard bodyClass="p-0 border-t dark:border-gray-600 h-full">
        <div className="flex flex-row h-full">
          <div className="flex flex-col h-min-full gap-4 w-3/12 border-r bg-gray-100 dark:bg-gray-800/50 dark:border-gray-600">
            {userConversations.map((conversation, index) => (
              <button
                key={index}
                onClick={() => handleLoadMessages(conversation.id)}
                className={`flex items-center space-x-3 py-2 px-8 hover:bg-gray-200 dark:hover:bg-gray-600 ${
                  selectedConversationId === conversation.id && showChatPanel ? 'bg-gray-300 dark:bg-gray-600/50' : ''
                }`}
              >
                <div className="flex justify-center items-center bg-primary text-white font-bold rounded-full w-10 h-10 overflow-hidden">
                  <span className="text-lg">{conversation.members[0].memberName.split(' ').slice(0, 2).map((n) => n[0]).join('')}</span>
                </div>
                <span className="text-gray-700 font-medium dark:text-white">{conversation.members[0].memberName.split(' ')[0]}</span>
              </button>
            ))}
          </div>
          {showChatPanel && (
            <div className="w-9/12 h-min-full pb-4 dark:bg-gray-600">
              {messages && messages.length !== 0 ? (
                <>
                  <div className="text-2xl font-bold text-primary pl-8 py-3 dark:text-secondary dark:bg-gray-600 border-b dark:border-gray-500">
                    {isMessaging?.members[0].name.split(' ')[0]}
                  </div>
                  <ChatWindow messages={messages} onSendMessage={sendMessage} userData={userData} />
                  <div ref={lastMessageRef} /> {/* Element to scroll into view */}
                </>
              ) : (
                <div className="w-full pl-4 h-full flex items-center">
                 
                </div>
              )}
            </div>
          )}
        </div>
      </HeaderCard>
    </div>
  );
};

export default CommunicationPortal;
import React, { useState, useEffect, useRef  } from 'react';
import ChatBubble from './ChatBubble';
import { IconButton } from '../UI Elements/Button';

const ChatWindow = ({ messages, onSendMessage, userData }) => {
  const [messageText, setMessageText] = useState('');
  // const socketRef = useRef(null);
  /*
  useEffect(() => {
    // Establish WebSocket connection
    socketRef.current = new WebSocket('wss://server.claritybusinesssolutions.ca:4343');

    socketRef.current.onopen = () => {
      console.log('WebSocket connection established');
    };

    socketRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('socketMessage', message)
    };

    socketRef.current.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      socketRef.current.close();
    };
  }, [onSendMessage]); 
  */

  const getCurrentLocalTime = () => {
    const date = new Date();
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
  
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
  
    const strTime = `${hours}:${minutesStr} ${ampm}`;
    return strTime;
  };

  const handleInputChange = (e) => {
    setMessageText(e.target.value);
  };

  const handleSendMessage = () => {
    const currentTime = getCurrentLocalTime()
    // update state
    // send to webApp
    if (messageText.trim() !== '') {
      const message = {
        name: userData.userData.userInfo.firstName,
        timeText: currentTime,
        chatText: messageText,
        status: "delivered",
        sendDirection: "out"
      }
      console.log({message})

      // socketRef.current.send(JSON.stringify(message));

      setMessageText('');
      onSendMessage(message);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        {messages.map((message, index) => (
          <ChatBubble 
            key={index}
            name={message.name}
            timeText={message.timeText}
            chatText={message.chatText}
            status={message.status}
            sendDirection={message.sendDirection}
          />
        ))}
      </div>
      <div className="flex items-center gap-4 my-4">
        <input
          type="text"
          value={messageText}
          onChange={handleInputChange}
          placeholder="Message cleaner..."
          className="flex-grow p-3 border border-gray-300 rounded dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600"
        />
        <IconButton
          icon="Send"
          onClick={handleSendMessage}
          className="btn btn-primary"
          text="Send to Cleaner"
        />
      </div>
    </div>
  );
};

export default ChatWindow;

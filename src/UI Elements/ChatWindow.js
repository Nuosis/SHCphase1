import React, { useState, useEffect, useRef  } from 'react';
import ChatBubble from './ChatBubble';
import { IconButton } from '../UI Elements/Button';

const ChatWindow = ({ messages, onSendMessage, userData }) => {
  const [messageText, setMessageText] = useState('');
  const socketRef = useRef(null);
  
  useEffect(() => {
    // Establish WebSocket connection
    socketRef.current = new WebSocket('wss://your-websocket-server-url');

    socketRef.current.onopen = () => {
      console.log('WebSocket connection established');
    };

    socketRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      // Assuming onSendMessage handles updating the messages state
      onSendMessage(message);
    };

    socketRef.current.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      socketRef.current.close();
    };
  }, []);

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
    if (messageText.trim() !== '') {
      const message = {
        name: userData.userData.userInfo.firstName,
        timeText: currentTime,
        chatText: messageText,
        status: "sent",
        sendDirection: "out"
      }
      socketRef.current.send(JSON.stringify(message));
      setMessageText('');
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
          placeholder="Type a message"
          className="flex-grow p-3 border rounded dark:bg-gray-600 dark:text-gray-400 dark:border-gray-700"
        />
       <IconButton
          icon="Send"
          onClick={handleSendMessage}
          className="btn btn-primary"
          text="Send"
        />
      </div>
    </div>
  );
};

export default ChatWindow;

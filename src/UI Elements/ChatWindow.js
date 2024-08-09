import React, { useState, useEffect, useRef } from 'react';
import ChatBubble from './ChatBubble';
import { IconButton } from '../UI Elements/Button';

const ChatWindow = ({ messages, onSendMessage, userData }) => {
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null); // Ref to track the end of the message list

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
    const currentTime = getCurrentLocalTime();

    if (messageText.trim() !== '') {
      const message = {
        name: userData.userData.userInfo.firstName,
        timeText: currentTime,
        chatText: messageText,
        status: "delivered",
        sendDirection: "out"
      };
      console.log({ message });

      setMessageText('');
      onSendMessage(message);
    }
  };

  // Scroll to the bottom of the messages container whenever the messages array is updated
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex flex-col gap-4 px-8">
      <div className="flex flex-col gap-4 overflow-y-scroll" style={{ maxHeight: "44vh" }}>
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
        {/* Element to keep track of the end of the messages */}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          value={messageText}
          onChange={handleInputChange}
          placeholder="Message..."
          className="flex-grow p-3 border border-gray-300 rounded dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600"
        />
        <IconButton
          icon="Send"
          onClick={handleSendMessage}
          className="btn btn-primary"
          text="Send Message"
        />
      </div>
    </div>
  );
};

export default ChatWindow;
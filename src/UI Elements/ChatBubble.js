import React from 'react';
import 'daisyui';

const ChatBubble = ({ name, timeText, chatText, status, sendDirection}) => {
  let chatBubbleClass
  let chatBubbleType
  if(sendDirection==="in"){
    chatBubbleclassName="chat chat-start"
  } else {
    chatBubbleclassName="chat chat-end"
    chatBubbleType="chat-bubble-info"
  }
  return (
    <div className={`${chatBubbleClass}`}>
      <div className="chat-header dark:text-gray-400 mx-2">
        {name}
        <time className="text-xs opacity-50 px-1 dark:text-gray-400">{timeText}</time>
      </div>
      <div className={`chat-bubble ${chatBubbleType} w-max-1/3 text-black dark:text-white ${chatBubbleType === 'chat-bubble-info' ? 'text-white' : 'dark:bg-gray-500 bg-gray-200'}`}>{chatText}</div>
      <div className="chat-footer opacity-50 dark:text-gray-400 mx-2">{status}</div>
    </div>
  )
}

export default ChatBubble;
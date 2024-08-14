import React, { useState, useEffect } from 'react';
import { fetchMessages, sendMessage } from '../services/chatbot';

export default function Roadmap() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [buttons, setButtons] = useState([]);

  useEffect(() => {
    async function loadMessages() {
      const msgs = await fetchMessages();
      setMessages(msgs);
    }
    loadMessages();
  }, []);

  const handleSend = async () => {
    const response = await sendMessage(input);
    setMessages([...messages, { text: input, user: true }, response]);
    setInput('');
    if (response.buttons) {
      setButtons(response.buttons);
    } else {
      setButtons([]);
    }
  };

  return (
    <div className="roadmap">
      <div className="chat-window">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-bubble ${msg.user ? 'chat-bubble-user' : 'chat-bubble-bot'}`}>
            {msg.text}
          </div>
        ))}
      </div>
      {buttons.length > 0 ? (
        <div className="button-options">
          {buttons.map((btn, idx) => (
            <button key={idx} onClick={() => handleSend(btn.text)}>
              {btn.text}
            </button>
          ))}
        </div>
      ) : (
        <div className="input-area">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
          />
          <button onClick={handleSend}>Send</button>
        </div>
      )}
    </div>
  );
}

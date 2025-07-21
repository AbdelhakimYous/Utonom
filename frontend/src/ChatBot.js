import React, { useState } from 'react';

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { type: 'bot', text: "Bonjour 👋 ! Je suis ton assistant de transport. Pose-moi une question." }
  ]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { type: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch('http://localhost:8004/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      const botMessage = { type: 'bot', text: data.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [...prev, { type: 'bot', text: "Erreur de connexion au serveur." }]);
    }

    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Chatbot Utonom 🤖</h2>
      <div style={styles.chatBox}>
        {messages.map((msg, index) => (
          <div key={index} style={{ ...styles.message, alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start', background: msg.type === 'user' ? '#DCF8C6' : '#eee' }}>
            {msg.text}
          </div>
        ))}
      </div>
      <div style={styles.inputContainer}>
        <input
          style={styles.input}
          type="text"
          placeholder="Écris ta question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button style={styles.button} onClick={sendMessage}>Envoyer</button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '400px',
    margin: '50px auto',
    border: '1px solid #ccc',
    borderRadius: '10px',
    padding: '20px',
    fontFamily: 'Arial',
    backgroundColor: '#f9f9f9',
  },
  title: {
    textAlign: 'center',
    marginBottom: '10px',
  },
  chatBox: {
    display: 'flex',
    flexDirection: 'column',
    height: '300px',
    overflowY: 'scroll',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    backgroundColor: '#fff',
    marginBottom: '10px',
  },
  message: {
    maxWidth: '70%',
    padding: '10px',
    marginBottom: '8px',
    borderRadius: '8px',
  },
  inputContainer: {
    display: 'flex',
    gap: '10px',
  },
  input: {
    flex: 1,
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '10px 15px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
  }
};

export default ChatBot;

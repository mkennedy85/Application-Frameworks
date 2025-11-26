import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);

  // Dynamically determine WebSocket URL based on current location
  const getWebSocketUrl = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const hostname = window.location.hostname;

    // For development, use localhost:8080
    // For production/K8s, use the same hostname with port 8080
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'ws://localhost:8080';
    } else {
      return `${protocol}//${hostname}:8080`;
    }
  };

  const WS_URL = getWebSocketUrl();
  const API_URL = process.env.REACT_APP_API_URL || `http://${window.location.hostname}:8080`;

  useEffect(() => {
    if (isJoined) {
      connectWebSocket();
    }
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isJoined]);

  const connectWebSocket = () => {
    console.log('Attempting WebSocket connection to:', WS_URL);
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('✓ WebSocket Connected successfully');
      setIsConnected(true);
      // Send join message
      ws.send(JSON.stringify({
        type: 'join',
        username: username,
        timestamp: new Date().toISOString()
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'message') {
        setMessages(prev => [...prev, data]);
      } else if (data.type === 'userList') {
        setUsers(data.users || []);
      } else if (data.type === 'userJoined' || data.type === 'userLeft') {
        setMessages(prev => [...prev, data]);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket Disconnected');
      setIsConnected(false);
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (isJoined) {
          connectWebSocket();
        }
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error('✗ WebSocket Error:', error);
      console.error('Failed to connect to:', WS_URL);
      setIsConnected(false);
    };
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (username.trim()) {
      setIsJoined(true);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && wsRef.current && isConnected) {
      wsRef.current.send(JSON.stringify({
        type: 'message',
        username: username,
        content: message,
        timestamp: new Date().toISOString()
      }));
      setMessage('');
    }
  };

  const handleLeave = () => {
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'leave',
        username: username,
        timestamp: new Date().toISOString()
      }));
      wsRef.current.close();
    }
    setIsJoined(false);
    setMessages([]);
    setUsers([]);
    setUsername('');
  };

  if (!isJoined) {
    return (
      <div className="app">
        <div className="join-container">
          <h1>Chat App - Microservices</h1>
          <form onSubmit={handleJoin} className="join-form">
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="username-input"
              autoFocus
            />
            <button type="submit" className="join-button">
              Join Chat
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="chat-container">
        <div className="chat-header">
          <div className="header-left">
            <h2>Chat Room</h2>
            <span className={`status ${isConnected ? 'connected' : 'disconnected'}`}>
              {isConnected ? '● Connected' : '● Disconnected'}
            </span>
          </div>
          <div className="header-right">
            <span className="username-display">Logged in as: {username}</span>
            <button onClick={handleLeave} className="leave-button">
              Leave
            </button>
          </div>
        </div>

        <div className="chat-body">
          <div className="messages-panel">
            <div className="messages-container">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${
                    msg.type === 'userJoined' || msg.type === 'userLeft'
                      ? 'system-message'
                      : msg.username === username
                      ? 'own-message'
                      : 'other-message'
                  }`}
                >
                  {msg.type === 'message' && (
                    <>
                      <div className="message-header">
                        <span className="message-username">{msg.username}</span>
                        <span className="message-time">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="message-content">{msg.content}</div>
                    </>
                  )}
                  {(msg.type === 'userJoined' || msg.type === 'userLeft') && (
                    <div className="system-content">{msg.content}</div>
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="message-input-form">
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="message-input"
                disabled={!isConnected}
              />
              <button
                type="submit"
                className="send-button"
                disabled={!isConnected || !message.trim()}
              >
                Send
              </button>
            </form>
          </div>

          <div className="users-panel">
            <h3>Online Users ({users.length})</h3>
            <div className="users-list">
              {users.map((user, index) => (
                <div key={index} className="user-item">
                  <span className="user-status">●</span>
                  <span className="user-name">{user}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

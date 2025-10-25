<template>
  <div id="app">
    <div v-if="!hasJoined" class="join-container">
      <div class="join-box">
        <h1>Vue Chat</h1>
        <form @submit.prevent="joinChat">
          <input
            v-model="username"
            type="text"
            placeholder="Enter your username"
            class="username-input"
            autofocus
          />
          <button type="submit" class="join-button">
            Join Chat
          </button>
        </form>
      </div>
    </div>

    <div v-else class="chat-container">
      <div class="chat-header">
        <h1>Vue Chat</h1>
        <div class="connection-status">
          <span :class="['status-indicator', isConnected ? 'connected' : 'disconnected']"></span>
          <span>{{ isConnected ? 'Connected' : 'Disconnected' }}</span>
        </div>
      </div>

      <div class="messages-container" ref="messagesContainer">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="[
            'message',
            msg.type === 'JOIN' || msg.type === 'LEAVE' ? 'system-message' : '',
            msg.username === username ? 'own-message' : ''
          ]"
        >
          <div v-if="msg.type === 'JOIN' || msg.type === 'LEAVE'" class="system-text">
            {{ msg.message }}
          </div>
          <div v-else>
            <div class="message-header">
              <span class="username">{{ msg.username }}</span>
              <span class="timestamp">{{ formatTime(msg.timestamp) }}</span>
            </div>
            <div class="message-text">{{ msg.message }}</div>
          </div>
        </div>
      </div>

      <form @submit.prevent="sendMessage" class="input-container">
        <input
          v-model="inputMessage"
          type="text"
          placeholder="Type a message..."
          class="message-input"
          :disabled="!isConnected"
        />
        <button
          type="submit"
          class="send-button"
          :disabled="!isConnected || !inputMessage.trim()"
        >
          Send
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import SockJS from 'sockjs-client';
import Stomp from 'webstomp-client';

export default {
  name: 'App',
  data() {
    return {
      username: '',
      inputMessage: '',
      messages: [],
      isConnected: false,
      hasJoined: false,
      stompClient: null,
      serverUrl: process.env.VUE_APP_SERVER_URL || 'http://localhost:8081'
    };
  },
  methods: {
    joinChat() {
      if (this.username.trim()) {
        this.hasJoined = true;
        this.connect();
      }
    },
    connect() {
      const socket = new SockJS(`${this.serverUrl}/ws`);
      this.stompClient = Stomp.over(socket);

      this.stompClient.connect(
        {},
        () => {
          this.isConnected = true;
          console.log('Connected to WebSocket');

          this.stompClient.subscribe('/topic/public', (message) => {
            const receivedMessage = JSON.parse(message.body);
            this.messages.push(receivedMessage);
            this.$nextTick(() => {
              this.scrollToBottom();
            });
          });

          // Send join message
          this.stompClient.send(
            '/app/chat.addUser',
            JSON.stringify({ username: this.username }),
            {}
          );
        },
        (error) => {
          console.error('Connection error:', error);
          this.isConnected = false;
          setTimeout(() => {
            if (this.hasJoined) {
              this.connect();
            }
          }, 3000);
        }
      );
    },
    sendMessage() {
      if (this.inputMessage.trim() && this.stompClient && this.isConnected) {
        const chatMessage = {
          username: this.username,
          message: this.inputMessage,
          type: 'CHAT'
        };

        this.stompClient.send(
          '/app/chat.sendMessage',
          JSON.stringify(chatMessage),
          {}
        );

        this.inputMessage = '';
      }
    },
    formatTime(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    scrollToBottom() {
      const container = this.$refs.messagesContainer;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  },
  beforeUnmount() {
    if (this.stompClient) {
      this.stompClient.disconnect();
    }
  }
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f5f5;
}

#app {
  min-height: 100vh;
}

.join-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #42b983 0%, #35495e 100%);
}

.join-box {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  text-align: center;
  min-width: 350px;
}

.join-box h1 {
  margin-bottom: 30px;
  color: #333;
}

.username-input {
  width: 100%;
  padding: 12px;
  margin-bottom: 20px;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.username-input:focus {
  outline: none;
  border-color: #42b983;
}

.join-button {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #42b983 0%, #35495e 100%);
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.join-button:hover {
  transform: translateY(-2px);
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 800px;
  margin: 0 auto;
  background: white;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

.chat-header {
  background: linear-gradient(135deg, #42b983 0%, #35495e 100%);
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header h1 {
  font-size: 24px;
  margin: 0;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #ccc;
}

.status-indicator.connected {
  background-color: #4caf50;
  box-shadow: 0 0 10px #4caf50;
}

.status-indicator.disconnected {
  background-color: #f44336;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f9f9f9;
}

.message {
  margin-bottom: 15px;
  padding: 12px;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  max-width: 70%;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.own-message {
  margin-left: auto;
  background: linear-gradient(135deg, #42b983 0%, #35495e 100%);
  color: white;
}

.message.own-message .username,
.message.own-message .timestamp {
  color: rgba(255, 255, 255, 0.9);
}

.system-message {
  text-align: center;
  background-color: #e8f5e9;
  color: #2e7d32;
  font-style: italic;
  max-width: 100%;
  margin: 10px auto;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
  font-size: 12px;
}

.username {
  font-weight: bold;
  color: #42b983;
}

.timestamp {
  color: #999;
}

.message-text {
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
}

.system-text {
  font-size: 13px;
}

.input-container {
  display: flex;
  padding: 20px;
  background-color: #fff;
  border-top: 1px solid #e0e0e0;
}

.message-input {
  flex: 1;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 25px;
  font-size: 14px;
  margin-right: 10px;
  transition: border-color 0.3s;
}

.message-input:focus {
  outline: none;
  border-color: #42b983;
}

.message-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.send-button {
  padding: 12px 30px;
  background: linear-gradient(135deg, #42b983 0%, #35495e 100%);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, opacity 0.3s;
}

.send-button:hover:not(:disabled) {
  transform: translateY(-2px);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.send-button:active:not(:disabled) {
  transform: translateY(0);
}

.messages-container::-webkit-scrollbar {
  width: 8px;
}

.messages-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>

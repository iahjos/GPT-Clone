const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatLog = document.getElementById('chat-log');
const historyList = document.getElementById('chat-history');
const newChatBtn = document.getElementById('new-chat');

let currentChatId = null;
let chats = {};

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const userMessage = input.value.trim();
  if (!userMessage) return;

  addMessage('user', userMessage);
  input.value = '';

  const loadingMsg = addMessage('ai', 'Thinking...');

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: userMessage })
    });
    const data = await response.json();
    loadingMsg.textContent = data.message || 'No response from AI';
    saveMessageToHistory('user', userMessage);
    saveMessageToHistory('ai', data.message);
  } catch (error) {
    loadingMsg.textContent = 'Error talking to AI.';
  }
});

function addMessage(role, text) {
  const msg = document.createElement('div');
  msg.className = `message ${role}`;
  msg.textContent = text;
  chatLog.appendChild(msg);
  chatLog.scrollTop = chatLog.scrollHeight;
  return msg;
}

function startNewChat() {
  chatLog.innerHTML = '';
  currentChatId = Date.now().toString();
  chats[currentChatId] = [];
  renderChatHistory();
}

function saveMessageToHistory(role, text) {
  if (!currentChatId) {
    startNewChat();
  }
  chats[currentChatId].push({ role, text });
  localStorage.setItem('chats', JSON.stringify(chats));
}

function renderChatHistory() {
  historyList.innerHTML = '';
  for (const id in chats) {
    const item = document.createElement('li');
    const date = new Date(parseInt(id)).toLocaleString();
    item.textContent = date;
    item.onclick = () => loadChat(id);
    historyList.appendChild(item);
  }
}

function loadChat(chatId) {
  currentChatId = chatId;
  chatLog.innerHTML = '';
  chats[chatId].forEach(msg => addMessage(msg.role, msg.text));
}

// Load from localStorage on page load
window.onload = () => {
  chats = JSON.parse(localStorage.getItem('chats')) || {};
  renderChatHistory();
};

newChatBtn.addEventListener('click', startNewChat);

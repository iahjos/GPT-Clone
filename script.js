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
    localStorage.setItem('currentChatId', currentChatId);
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
      const chat = chats[id];
      const titleText = chat.title || chat.find(msg => msg.role === 'user')?.text || 'Untitled Chat';
  
      const item = document.createElement('li');
  
      const titleSpan = document.createElement('span');
      titleSpan.className = 'chat-title';
      titleSpan.textContent = titleText.length > 40 ? titleText.slice(0, 40) + '...' : titleText;
  
      // 👉 Load chat on click
      titleSpan.onclick = () => loadChat(id);
  
      // ✏️ Rename inline on double-click
      titleSpan.ondblclick = (e) => {
        e.stopPropagation();
  
        const input = document.createElement('input');
        input.type = 'text';
        input.value = chats[id].title || titleText;
        input.className = 'rename-input';
  
        // Save on blur or Enter
        input.onblur = saveRename;
        input.onkeydown = (event) => {
          if (event.key === 'Enter') input.blur();
        };
  
        function saveRename() {
          chats[id].title = input.value.trim() || 'Untitled Chat';
          localStorage.setItem('chats', JSON.stringify(chats));
          renderChatHistory(); // re-render updated name
        }
  
        item.replaceChild(input, titleSpan);
        input.focus();
      };
  
      // ❌ Delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-chat';
      deleteBtn.textContent = '-';
      deleteBtn.onclick = (e) => {
        e.stopPropagation();
        if (confirm('Delete this chat?')) {
          delete chats[id];
          if (currentChatId === id) startNewChat();
          localStorage.setItem('chats', JSON.stringify(chats));
          renderChatHistory();
        }
      };
  
      item.appendChild(titleSpan);
      item.appendChild(deleteBtn);
      historyList.appendChild(item);
    }
  }
  

  function loadChat(chatId) {
    currentChatId = chatId;
    localStorage.setItem('currentChatId', currentChatId);
    chatLog.innerHTML = '';
    chats[chatId].forEach(msg => addMessage(msg.role, msg.text));
  }
  

window.onload = () => {
    chats = JSON.parse(localStorage.getItem('chats')) || {};
    renderChatHistory();
  
    // Restore last used chat
    const storedCurrentId = localStorage.getItem('currentChatId');
    if (storedCurrentId && chats[storedCurrentId]) {
      currentChatId = storedCurrentId;
      loadChat(currentChatId);
    } else {
      startNewChat(); // fallback
    }
  };
  

newChatBtn.addEventListener('click', startNewChat);

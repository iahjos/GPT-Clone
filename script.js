const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatLog = document.getElementById('chat-log');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const userMessage = input.value.trim();
  if (!userMessage) return;

  addMessage('user', userMessage);
  input.value = '';

  // Add loading message
  const loadingMsg = addMessage('ai', 'Thinking...');

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: userMessage })
    });

    const data = await response.json();
    loadingMsg.textContent = data.message || 'No response from AI';
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

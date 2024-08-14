export async function fetchMessages() {
  const response = await fetch('/chatbot');
  if (response.ok) {
    return response.json();
  }
  throw new Error('Failed to fetch messages');
}

export async function sendMessage(text) {
  const response = await fetch('/chatbot', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });
  if (response.ok) {
    return response.json();
  }
  throw new Error('Failed to send message');
}

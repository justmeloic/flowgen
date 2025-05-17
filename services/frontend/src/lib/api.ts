import { v4 as uuidv4 } from 'uuid';

const BASE_URL = 'http://localhost:8000';  // Updated to FastAPI default port

interface MessageResponse {
  response: string;
}

export const sendMessage = async (message: string): Promise<MessageResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/root_agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': localStorage.getItem('chatSessionId') || uuidv4(),
      },
      body: JSON.stringify({ text: message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Store the session ID if it's a new session
    const sessionId = response.headers.get('X-Session-ID');
    if (sessionId) {
      localStorage.setItem('chatSessionId', sessionId);
    }

    return data;
  } catch (error) {
    console.error('Failed to send message:', error);
    throw error;
  }
};

// Initialize session and store session ID
export const createSession = async () => {
  const sessionId = uuidv4();
  localStorage.setItem('chatSessionId', sessionId);
  return Promise.resolve();
};

import { v4 as uuidv4 } from 'uuid';

// Use environment variable with fallback
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

interface Reference {
  id: string;
  name: string;
  title: string;
  link: string;
}

interface MessageResponse {
  response: string;
  references: { [key: string]: Reference };
}

export const sendMessage = async (message: string): Promise<MessageResponse> => {
  try {
    const storedSessionId = localStorage.getItem('chatSessionId');
    
    const response = await fetch(`${BASE_URL}/api/v1/root_agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(storedSessionId && { 'X-Session-ID': storedSessionId }),
      },
      body: JSON.stringify({ text: message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get session ID from response header
    const sessionId = response.headers.get('X-Session-ID');
    if (sessionId) {
      localStorage.setItem('chatSessionId', sessionId);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to send message:', error);
    throw error;
  }
};

export const hasExistingSession = (): boolean => {
  return !!localStorage.getItem('chatSessionId');
};

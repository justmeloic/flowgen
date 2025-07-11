import { v4 as uuidv4 } from 'uuid';

// Use environment variable with fallback
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost/:8081';

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
    
    const response = await fetch(`${BASE_URL}/api/v1/root_agent/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': storedSessionId || '', // Always send the header, even if empty
      },
      body: JSON.stringify({ text: message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get session ID from response header and store it if present
    const newSessionId = response.headers.get('x-session-id'); // Note: header names are case-insensitive
    if (newSessionId) {
      localStorage.setItem('chatSessionId', newSessionId);
      console.log('Stored new session ID:', newSessionId); // Debug logging
    } else {
      console.warn('No session ID received from server'); // Debug logging
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

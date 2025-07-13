// Use environment variable with fallback; 
// setting the fallback to an empty string will cause the frontend 
// to use relative paths for API requests.
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ''; 

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

export const login = async (secret: string, name: string) => {
  const response = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ secret, name }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Login failed');
  }

  const newSessionId = response.headers.get('x-session-id');
  if (newSessionId) {
    localStorage.setItem('chatSessionId', newSessionId);
  }

  return response.json();
};

export const logout = async () => {
  const storedSessionId = localStorage.getItem('chatSessionId');
  const response = await fetch(`${BASE_URL}/api/v1/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-ID': storedSessionId || '',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Logout failed');
  }

  localStorage.removeItem('chatSessionId');
  return response.json();
};

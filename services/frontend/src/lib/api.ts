/**
 * Copyright 2025 Loïc Muhirwa
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { MessageResponse, Model } from "@/types";

// Use environment variable with fallback; 
// setting the fallback to an empty string will cause the frontend 
// to use relative paths for API requests.
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export interface SendMessageOptions {
  model?: string;
  platform?: 'aws' | 'gcp' | 'azure';
  signal?: AbortSignal;
}

export const sendMessage = async (
  message: string, 
  files?: File[],
  options?: SendMessageOptions
): Promise<MessageResponse> => {
  try {
    const storedSessionId = localStorage.getItem('chatSessionId');
    
    // Use FormData for file uploads
    const formData = new FormData();
    formData.append('text', message);
    
    if (options?.model) {
      formData.append('model', options.model);
    }
    if (options?.platform) {
      formData.append('platform', options.platform);
    }
    
    // Add files if provided
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }
    
    const response = await fetch(`${BASE_URL}/api/v1/root_agent/`, {
      method: 'POST',
      headers: {
        'X-Session-ID': storedSessionId || '', // Don't set Content-Type for FormData
      },
      body: formData,
      signal: options?.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get session ID from response header and store it if present
    const newSessionId = response.headers.get('x-session-id'); // Note: header names are case-insensitive
    if (newSessionId) {
      // If session ID changed, clear the chat data (indicates new session)
      if (storedSessionId && storedSessionId !== newSessionId) {
        localStorage.removeItem('chatHistory');
        localStorage.removeItem('chatReferences');
        localStorage.removeItem('isFirstPrompt');
        console.log('Session ID changed, cleared chat data');
      }
      
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

export const getAvailableModels = async (): Promise<{ models: Record<string, Model>; default_model: string }> => {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/root_agent/models`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch available models:', error);
    throw error;
  }
};

export const hasExistingSession = (): boolean => {
  return !!localStorage.getItem('chatSessionId');
};

export const startNewSession = (): void => {
  // Clear the stored session ID to force creation of a new session
  localStorage.removeItem('chatSessionId');
  // Clear persisted chat data
  localStorage.removeItem('chatHistory');
  localStorage.removeItem('chatReferences');
  localStorage.removeItem('isFirstPrompt');
  console.log('Cleared session ID and chat data - next request will create a new session');
};

export const submitBugReport = async (bugData: {
  description: string;
  diagram?: any;
  chatHistory?: any[];
  userAgent?: string;
  timestamp?: string;
  url?: string;
}): Promise<{ success: boolean; bug_id: string; message: string }> => {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/bugs/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bugData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to submit bug report:', error);
    throw error;
  }
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

  // Clear all session and chat data
  localStorage.removeItem('chatSessionId');
  localStorage.removeItem('chatHistory');
  localStorage.removeItem('chatReferences');
  localStorage.removeItem('isFirstPrompt');
  return response.json();
};

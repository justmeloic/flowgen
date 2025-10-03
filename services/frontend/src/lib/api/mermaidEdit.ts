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

import { DiagramType } from '@/types/mermaid';

// Use environment variable with fallback; 
// setting the fallback to an empty string will cause the frontend 
// to use relative paths for API requests.
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export interface MermaidEditRequest {
  content: string;
  instructions: string;
  diagram_type: DiagramType;
  diagram_title?: string;
  additional_context?: string;
}

export interface MermaidEditResponse {
  success: boolean;
  content: string;
  diagram_type: DiagramType;
}

export const editMermaidDiagram = async (
  request: MermaidEditRequest
): Promise<MermaidEditResponse> => {
  try {
    const storedSessionId = localStorage.getItem('chatSessionId');
    
    const response = await fetch(`${BASE_URL}/api/v1/mermaid/edit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': storedSessionId || '',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to edit mermaid diagram:', error);
    throw error;
  }
};

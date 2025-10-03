import { DiagramType } from '@/types/mermaid';

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

class MermaidEditAPI {
  private baseUrl: string;

  constructor() {
    // Use environment variable with fallback; 
    // setting the fallback to an empty string will cause the frontend 
    // to use relative paths for API requests.
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  }

  async editDiagram(request: MermaidEditRequest): Promise<MermaidEditResponse> {
    const storedSessionId = localStorage.getItem('chatSessionId');
    
    const response = await fetch(`${this.baseUrl}/api/v1/mermaid/edit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': storedSessionId || '', // Always send the header, even if empty
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export const mermaidEditAPI = new MermaidEditAPI();

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
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081';
  }

  async editDiagram(request: MermaidEditRequest): Promise<MermaidEditResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/mermaid/edit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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

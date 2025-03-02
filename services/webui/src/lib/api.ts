interface MermaidRequest {
  message: string;
  conversation_id?: string; 
}

interface MermaidResponse {
  response: string;
  conversation_id: string;
}

export const sendMermaidQuery = async (
  message: string,
  conversation_id?: string 
): Promise<MermaidResponse> => {
  const requestBody: MermaidRequest = { message, conversation_id };
  const response = await fetch('http://0.0.0.0:8080/api/v1/mermaid', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`Failed to send mermaid query: ${response.statusText}`);
  }

  const data: MermaidResponse = await response.json();
  return data;
};

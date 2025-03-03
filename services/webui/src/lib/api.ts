interface MermaidRequest {
  message: string;
  conversation_id?: string;
  files?: File[];
}

interface MermaidResponse {
  response: string;
  conversation_id: string;
}

export const sendMermaidQuery = async (
  message: string,
  conversation_id?: string,
  files?: File[],
): Promise<MermaidResponse> => {
  const formData = new FormData();
  formData.append("message", message);
  if (conversation_id) {
    formData.append("conversation_id", conversation_id);
  }

  if (files) {
    files.forEach((file) => {
      formData.append("files", file);
    });
  }

  const response = await fetch('http://0.0.0.0:8080/api/v1/mermaid', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to send mermaid query: ${response.statusText}`);
  }

  const data: MermaidResponse = await response.json();
  return data;
};

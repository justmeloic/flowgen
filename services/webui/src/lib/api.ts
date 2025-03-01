interface ChatRequest {
  message: string;
}

interface ChatResponse {
  response: string;
}


interface SearchRequest {
  query: string;
}

interface SearchResultDocument {
  name: string;
  uri: string;
  snippets: string[];
}

interface SearchResponse {
  results: SearchResultDocument[];
  summary: string | null;
}

export const sendChatMessage = async (message: string): Promise<string> => {
  const response = await fetch('http://0.0.0.0:8080/api/v1/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error('Failed to send chat message');
  }

  const data: ChatResponse = await response.json();
  return data.response;
};


export const sendSearchQuery = async (query: string): Promise<SearchResponse> => {
  const response = await fetch('http://0.0.0.0:8080/api/v1/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error('Failed to send search query');
  }

  const data: SearchResponse = await response.json();
  return data;
};

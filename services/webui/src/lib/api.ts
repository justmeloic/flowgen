type _MermaidRequest = {
  message: string
  engine: string
  conversation_id?: string
  files?: File[]
}

interface MermaidResponse {
  response: string
  conversation_id: string
}

// Use environment variable with fallback
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export const sendMermaidQuery = async (
  message: string,
  engine: string,
  conversation_id?: string,
  files?: File[]
): Promise<MermaidResponse> => {
  const formData = new FormData()
  formData.append('message', message)
  formData.append('engine', engine)
  if (conversation_id) {
    formData.append('conversation_id', conversation_id)
  }

  if (files) {
    files.forEach((file) => {
      formData.append('files', file)
    })
  }

  const response = await fetch(`${BASE_URL}/api/v1/mermaid`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Failed to send mermaid query: ${response.statusText}`)
  }

  const data: MermaidResponse = await response.json()
  return data
}

import { useState } from 'react'

export const useMermaidApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [diagram, setDiagram] = useState<string | null>(null)

  const generateDiagram = async (prompt: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/v1/mermaid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate diagram')
      }

      const data = await response.json()
      // Extract and clean mermaid code from response
      if (data.diagram) {
        const cleanedDiagram = data.diagram
          .replace(/```mermaid\n?/, '')
          .replace(/```$/, '')
          .trim()
        setDiagram(cleanedDiagram)
      } else {
        throw new Error('Invalid diagram data received')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setDiagram(null)
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    diagram,
    generateDiagram,
  }
}

import React, { useEffect, useRef } from 'react'
import mermaid from 'mermaid'

interface MermaidProps {
  chart: string
}

const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
  const mermaidRef = useRef<HTMLDivElement>(null)

  const cleanMermaidCode = (code: string): string => {
    // Remove markdown code block markers if present
    let cleaned = code.replace(/```mermaid\n?/, '').replace(/```$/, '')
    // Remove leading/trailing whitespace
    cleaned = cleaned.trim()
    // Ensure proper line endings
    cleaned = cleaned.replace(/\r\n/g, '\n')
    return cleaned
  }

  useEffect(() => {
    const renderDiagram = async () => {
      if (mermaidRef.current && chart) {
        try {
          // Initialize mermaid with configuration
          mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            securityLevel: 'loose',
            logLevel: 'error',
          })

          // Clean the chart code before rendering
          const cleanedChart = cleanMermaidCode(chart)

          // Clear the previous content
          mermaidRef.current.innerHTML = ''

          // Generate and insert the SVG
          const { svg } = await mermaid.render('mermaid-diagram', cleanedChart)
          mermaidRef.current.innerHTML = svg
        } catch (error) {
          console.error('Failed to render mermaid diagram:', error)
          mermaidRef.current.innerHTML = `
            <div class="p-4 text-red-500 border border-red-300 rounded">
              Failed to render diagram. Error: ${error instanceof Error ? error.message : 'Unknown error'}
              <pre class="mt-2 p-2 bg-gray-100 rounded text-sm">${chart}</pre>
            </div>`
        }
      }
    }

    renderDiagram()
  }, [chart])

  return <div ref={mermaidRef} className="mermaid w-full" />
}

export default Mermaid

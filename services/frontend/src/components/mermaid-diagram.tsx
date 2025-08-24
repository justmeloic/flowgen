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

"use client";

import mermaid from "mermaid";
import { useEffect, useRef, useState } from "react";

interface MermaidDiagramProps {
  chart: string;
  className?: string;
}

export function MermaidDiagram({ chart, className = "" }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize mermaid with configuration
    mermaid.initialize({
      startOnLoad: true,
      theme: "default",
      securityLevel: "loose",
      fontFamily: "Arial, sans-serif",
      fontSize: 14,
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: "basis",
      },
      themeVariables: {
        primaryColor: "#3b82f6",
        primaryTextColor: "#1f2937",
        primaryBorderColor: "#2563eb",
        lineColor: "#6b7280",
        secondaryColor: "#e5e7eb",
        tertiaryColor: "#f3f4f6",
        background: "#ffffff",
        mainBkg: "#ffffff",
        secondBkg: "#f9fafb",
        tertiaryBkg: "#f3f4f6",
      },
    });
  }, []);

  useEffect(() => {
    const renderChart = async () => {
      if (!ref.current || !chart.trim()) return;

      setIsLoading(true);
      setError(null);

      try {
        // Clear previous content
        ref.current.innerHTML = "";

        // Generate unique ID for this diagram
        const id = `mermaid-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        // Create a temporary element for mermaid to render into
        const tempDiv = document.createElement("div");
        tempDiv.id = id;
        ref.current.appendChild(tempDiv);

        // Render the mermaid diagram
        const { svg } = await mermaid.render(id, chart);

        // Replace the temporary div with the SVG
        ref.current.innerHTML = svg;

        setIsLoading(false);
      } catch (err) {
        console.error("Mermaid rendering error:", err);
        setError("Failed to render diagram");
        setIsLoading(false);
      }
    };

    renderChart();
  }, [chart]);

  if (!chart.trim()) {
    return null;
  }

  return (
    <div className={`mermaid-container ${className}`}>
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">
            Rendering diagram...
          </span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div
        ref={ref}
        className={`${isLoading || error ? "hidden" : ""}`}
        style={{
          maxWidth: "100%",
          overflow: "auto",
        }}
      />
    </div>
  );
}

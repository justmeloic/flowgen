/**
 * Copyright 2025 Google LLC
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

import {
  cleanMermaidCode,
  generateMermaidId,
  initializeMermaid,
  validateMermaidSyntax,
} from "@/lib/mermaid-config";
import mermaid from "mermaid";
import { useEffect, useRef, useState } from "react";

interface MermaidDiagramProps {
  chart: string;
  className?: string;
  isDarkMode?: boolean;
}

export function MermaidDiagram({
  chart,
  className = "",
  isDarkMode = false,
}: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mermaidInitialized, setMermaidInitialized] = useState(false);

  useEffect(() => {
    // Initialize mermaid with configuration
    const setupMermaid = async () => {
      try {
        const success = await initializeMermaid(isDarkMode);
        if (success) {
          setMermaidInitialized(true);
        } else {
          throw new Error("Failed to initialize Mermaid");
        }
      } catch (error) {
        console.error("Failed to initialize mermaid:", error);
        setError("Failed to initialize diagram renderer");
        setIsLoading(false);
      }
    };

    setupMermaid();
  }, [isDarkMode]);

  useEffect(() => {
    if (!mermaidInitialized || !chart.trim()) {
      setIsLoading(false);
      return;
    }

    const renderChart = async () => {
      if (!ref.current) return;

      setIsLoading(true);
      setError(null);

      try {
        // Clear previous content
        ref.current.innerHTML = "";

        // Clean and validate the chart input
        const cleanChart = cleanMermaidCode(chart);
        const validation = validateMermaidSyntax(cleanChart);

        if (!validation.isValid) {
          throw new Error(validation.error || "Invalid diagram syntax");
        }

        // Generate unique ID for this diagram
        const id = generateMermaidId();

        // Render the mermaid diagram
        const { svg } = await mermaid.render(id, cleanChart);

        // Replace the content with the SVG
        ref.current.innerHTML = svg;

        setIsLoading(false);
      } catch (err) {
        console.error("Mermaid rendering error:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(`Failed to render diagram: ${errorMessage}`);
        setIsLoading(false);

        // Show error with the problematic code
        if (ref.current) {
          ref.current.innerHTML = `
            <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-red-600 text-sm font-medium">Failed to render diagram</p>
              <p class="text-red-500 text-xs mt-1">${errorMessage}</p>
              <details class="mt-2">
                <summary class="text-xs text-gray-600 cursor-pointer">View code</summary>
                <pre class="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto"><code>${cleanMermaidCode(
                  chart
                )}</code></pre>
              </details>
            </div>
          `;
        }
      }
    };

    renderChart();
  }, [chart, mermaidInitialized]);

  if (!chart.trim()) {
    return null;
  }

  return (
    <div className={`mermaid-container ${className}`}>
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">
            {mermaidInitialized
              ? "Rendering diagram..."
              : "Initializing renderer..."}
          </span>
        </div>
      )}

      {error && !isLoading && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm font-medium">Error</p>
          <p className="text-red-500 text-xs">{error}</p>
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

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

import {
  cleanMermaidCode,
  generateMermaidId,
  initializeMermaid,
  validateMermaidSyntax,
} from "@/lib/mermaid-config";
import { Diagram } from "@/types";
import { useEffect, useState } from "react";

interface DiagramRendererProps {
  diagram: Diagram | null;
  isDarkMode?: boolean;
}

export function DiagramRenderer({
  diagram,
  isDarkMode = false,
}: DiagramRendererProps) {
  const [mermaidLoaded, setMermaidLoaded] = useState(false);

  useEffect(() => {
    // Initialize mermaid
    const setupMermaid = async () => {
      try {
        const success = await initializeMermaid(isDarkMode);
        if (success) {
          setMermaidLoaded(true);
        } else {
          console.error("Failed to initialize mermaid");
        }
      } catch (error) {
        console.error("Failed to load mermaid:", error);
      }
    };

    setupMermaid();
  }, [isDarkMode]);

  useEffect(() => {
    if (mermaidLoaded && diagram?.diagram_code) {
      // Re-render diagram when diagram changes
      const renderDiagram = async () => {
        try {
          const mermaid = (await import("mermaid")).default;
          const element = document.getElementById("mermaid-diagram");
          if (element) {
            // Clear previous content
            element.innerHTML = "";

            // Clean and validate the diagram code
            const cleanChart = cleanMermaidCode(diagram.diagram_code);
            const validation = validateMermaidSyntax(cleanChart);

            if (!validation.isValid) {
              throw new Error(validation.error || "Invalid diagram syntax");
            }

            // Generate unique ID for this diagram
            const id = generateMermaidId();

            // Use modern render API
            const { svg } = await mermaid.render(id, cleanChart);
            element.innerHTML = svg;
          }
        } catch (error) {
          console.error("Failed to render diagram:", error);
          const element = document.getElementById("mermaid-diagram");
          if (element) {
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error";
            const cleanChart = cleanMermaidCode(diagram.diagram_code);
            element.innerHTML = `
              <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p class="text-red-600 text-sm font-medium">Failed to render diagram</p>
                <p class="text-red-500 text-xs mt-1">${errorMessage}</p>
                <details class="mt-2">
                  <summary class="text-xs text-gray-600 cursor-pointer">View original code</summary>
                  <pre class="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto"><code>${cleanChart}</code></pre>
                </details>
              </div>
            `;
          }
        }
      };

      renderDiagram();
    }
  }, [diagram, mermaidLoaded]);

  return (
    <div className="border mx-6 rounded-3xl p-6 bg-white dark:bg-gray-800">
      <div
        id="mermaid-diagram"
        className="w-full overflow-auto flex items-center justify-center"
        style={{ minHeight: "400px" }}
      >
        {!mermaidLoaded && (
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">Loading diagram...</div>
          </div>
        )}
      </div>
    </div>
  );
}

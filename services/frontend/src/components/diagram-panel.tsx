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

interface DiagramPanelProps {
  diagram: Diagram | null;
  isHidden: boolean;
  onToggleVisibility: () => void;
  isDarkMode?: boolean;
}

export function DiagramPanel({
  diagram,
  isHidden,
  onToggleVisibility,
  isDarkMode = false,
}: DiagramPanelProps) {
  const [mermaidLoaded, setMermaidLoaded] = useState(false);
  const [showRawCode, setShowRawCode] = useState(false);

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

  const copyDiagramCode = () => {
    if (diagram?.diagram_code) {
      const cleanedCode = cleanMermaidCode(diagram.diagram_code);
      navigator.clipboard.writeText(cleanedCode);
    }
  };

  const downloadDiagram = () => {
    const svg = document.querySelector("#mermaid-diagram svg");
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Scale factor for higher resolution but more reasonable
        const scaleFactor = 2;
        canvas.width = img.width * scaleFactor;
        canvas.height = img.height * scaleFactor;

        // Draw the image at the scaled size
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.download = `${diagram?.title || "diagram"}.png`;
              link.href = url;
              link.click();
              URL.revokeObjectURL(url);
            }
          },
          "image/png",
          1.0
        );
      };

      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    }
  };

  if (!diagram || !diagram.diagram_code) {
    return (
      <div className="p-4 text-center text-gray-500">No diagram available</div>
    );
  }

  return (
    <div className="h-full relative">
      {/* Hide button - only show when panel is visible */}
      {!isHidden && (
        <button
          onClick={onToggleVisibility}
          className="absolute right-4 top-3 z-10 p-3 bg-blue-100 dark:bg-gray-700 rounded-full hover:bg-blue-200 dark:hover:bg-gray-600 transition-all duration-300 shadow-lg"
          aria-label="Close diagram"
        >
          <svg
            className="w-5 h-5 text-gray-600 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}

      {/* Panel content */}
      <div className="p-6 ">
        <div className="flex mx-7 items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            {diagram.title || "Architecture Diagram"}
          </h3>
        </div>

        {diagram.description && (
          <p className="mx-7 text-sm text-gray-600 dark:text-gray-400 mb-6">
            {diagram.description}
          </p>
        )}

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

        {/* All buttons centered under the diagram */}
        <div className="mt-6 flex justify-center">
          <div className="flex gap-2">
            <button
              onClick={copyDiagramCode}
              className="flex items-center gap-2 px-3 py-1.5 text-xs bg-blue-100 hover:bg-blue-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-gray-500"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Copy Code
            </button>
            <button
              onClick={downloadDiagram}
              className="flex items-center gap-2 px-3 py-1.5 text-xs bg-blue-100 hover:bg-blue-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-gray-500"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download
            </button>
            <button
              onClick={() => setShowRawCode(!showRawCode)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs bg-blue-100 hover:bg-blue-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-gray-500"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
              {showRawCode ? "Hide Code" : "View Code"}
            </button>
          </div>
        </div>

        {/* Raw code section (conditionally shown) */}
        {showRawCode && (
          <div className="mt-4">
            <div className="bg-gray-800 mx-64 rounded-xl border border-gray-700 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-gray-900 border-b border-gray-700">
                <span className="text-xs font-medium text-gray-300">
                  Mermaid Code
                </span>
                <span className="text-xs text-gray-400">
                  {cleanMermaidCode(diagram.diagram_code).split("\n").length}{" "}
                  lines
                </span>
              </div>
              <pre className="p-3 overflow-auto max-h-48 bg-gray-800">
                <code className="text-xs font-mono text-gray-200 leading-relaxed">
                  {cleanMermaidCode(diagram.diagram_code)}
                </code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

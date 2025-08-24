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

import { Button } from "@/components/ui/button";
import { Diagram } from "@/types";
import { useEffect, useState } from "react";

interface DiagramPanelProps {
  diagram: Diagram | null;
  isHidden: boolean;
  onToggleVisibility: () => void;
}

export function DiagramPanel({
  diagram,
  isHidden,
  onToggleVisibility,
}: DiagramPanelProps) {
  const [mermaidLoaded, setMermaidLoaded] = useState(false);

  useEffect(() => {
    // Dynamically import mermaid
    const loadMermaid = async () => {
      try {
        const mermaid = await import("mermaid");
        mermaid.default.initialize({
          startOnLoad: true,
          theme: "default",
          securityLevel: "loose",
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
          },
        });
        setMermaidLoaded(true);
      } catch (error) {
        console.error("Failed to load mermaid:", error);
      }
    };

    loadMermaid();
  }, []);

  useEffect(() => {
    if (mermaidLoaded && diagram?.diagram_code) {
      // Re-render diagram when diagram changes
      const renderDiagram = async () => {
        try {
          const mermaid = (await import("mermaid")).default;
          const element = document.getElementById("mermaid-diagram");
          if (element) {
            element.innerHTML = diagram.diagram_code;
            await mermaid.run({
              nodes: [element],
            });
          }
        } catch (error) {
          console.error("Failed to render diagram:", error);
        }
      };

      renderDiagram();
    }
  }, [diagram, mermaidLoaded]);

  const copyDiagramCode = () => {
    if (diagram?.diagram_code) {
      navigator.clipboard.writeText(diagram.diagram_code);
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
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.download = `${diagram?.title || "diagram"}.png`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
          }
        });
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
          className="absolute right-4 z-10 p-3 bg-blue-100 dark:bg-gray-700 rounded-full hover:bg-blue-200 dark:hover:bg-gray-600 transition-all duration-300 shadow-lg"
          aria-label="Hide diagram"
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}

      {/* Panel content */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            {diagram.title || "Architecture Diagram"}
          </h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyDiagramCode}
              className="text-xs"
            >
              Copy Code
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadDiagram}
              className="text-xs"
            >
              Download
            </Button>
          </div>
        </div>

        {diagram.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {diagram.description}
          </p>
        )}

        <div className="border rounded-lg p-4 bg-white dark:bg-gray-800">
          <div
            id="mermaid-diagram"
            className="w-full overflow-auto"
            style={{ minHeight: "200px" }}
          >
            {!mermaidLoaded && (
              <div className="flex items-center justify-center h-32">
                <div className="text-gray-500">Loading diagram...</div>
              </div>
            )}
          </div>
        </div>

        {/* Raw code section (collapsible) */}
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
            View Raw Code
          </summary>
          <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-900 rounded text-xs overflow-auto">
            <code>{diagram.diagram_code}</code>
          </pre>
        </details>
      </div>
    </div>
  );
}

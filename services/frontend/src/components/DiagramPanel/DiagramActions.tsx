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

import { cleanMermaidCode } from "@/lib/mermaid-config";
import { Diagram } from "@/types";
import { Code, Copy, Download, Edit } from "lucide-react";

interface DiagramActionsProps {
  diagram: Diagram;
  showRawCode: boolean;
  onToggleRawCode: () => void;
  onEditMermaid?: (diagram: Diagram) => void;
}

export function DiagramActions({
  diagram,
  showRawCode,
  onToggleRawCode,
  onEditMermaid,
}: DiagramActionsProps) {
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

  return (
    <div className="mt-6 flex justify-center">
      <div className="flex gap-2">
        <button
          onClick={copyDiagramCode}
          className="flex items-center gap-2 px-3 py-1.5 text-xs bg-blue-100 hover:bg-blue-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-gray-500"
        >
          <Copy className="w-3 h-3" />
          Copy Code
        </button>
        <button
          onClick={downloadDiagram}
          className="flex items-center gap-2 px-3 py-1.5 text-xs bg-blue-100 hover:bg-blue-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-gray-500"
        >
          <Download className="w-3 h-3" />
          Download
        </button>
        <button
          onClick={onToggleRawCode}
          className="flex items-center gap-2 px-3 py-1.5 text-xs bg-blue-100 hover:bg-blue-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-gray-500"
        >
          <Code className="w-3 h-3" />
          {showRawCode ? "Hide Code" : "View Code"}
        </button>
        {onEditMermaid && (
          <button
            onClick={() => onEditMermaid(diagram)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs bg-blue-100 hover:bg-blue-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-gray-500"
          >
            <Edit className="w-3 h-3" />
            Edit Code
          </button>
        )}
      </div>
    </div>
  );
}

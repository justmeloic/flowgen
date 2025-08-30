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

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

import { Diagram } from "@/types";
import { DiagramActions } from "./DiagramActions";
import { DiagramCodeViewer } from "./DiagramCodeViewer";
import { DiagramRenderer } from "./DiagramRenderer";

interface DiagramPanelProps {
  diagram: Diagram | null;
  isHidden: boolean;
  onToggleVisibility: () => void;
  onEditMermaid?: (diagram: Diagram) => void;
  isDarkMode?: boolean;
}

export function DiagramPanel({
  diagram,
  isHidden,
  onToggleVisibility,
  onEditMermaid,
  isDarkMode = false,
}: DiagramPanelProps) {
  const [showRawCode, setShowRawCode] = useState(false);

  if (!diagram || !diagram.diagram_code) {
    return (
      <div className="p-4 text-center text-gray-500">No diagram available</div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Fixed header with close button */}
      {!isHidden && (
        <div className="sticky top-0 z-50 flex justify-end p-4 bg-blue-50 dark:bg-secondary-dark">
          <button
            onClick={onToggleVisibility}
            className="p-3 bg-blue-100 dark:bg-gray-700 rounded-full hover:bg-blue-200 dark:hover:bg-gray-600 transition-all duration-300 shadow-lg"
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
        </div>
      )}

      {/* Scrollable panel content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex mx-7 items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
              {diagram.title || "Architecture Diagram"}
            </h3>
          </div>

          {diagram.description && (
            <div className="mx-7 mb-6 prose prose-sm dark:prose-invert text-gray-600 dark:text-gray-400">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                {diagram.description}
              </ReactMarkdown>
            </div>
          )}

          <DiagramRenderer diagram={diagram} isDarkMode={isDarkMode} />

          <DiagramActions
            diagram={diagram}
            showRawCode={showRawCode}
            onToggleRawCode={() => setShowRawCode(!showRawCode)}
            onEditMermaid={onEditMermaid}
          />

          <DiagramCodeViewer diagram={diagram} isVisible={showRawCode} />
        </div>
      </div>
    </div>
  );
}

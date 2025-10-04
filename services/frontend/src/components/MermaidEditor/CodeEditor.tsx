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
  Check,
  Code,
  CodeXml,
  Copy,
  Download,
  Sparkles,
  Undo,
} from "lucide-react";
import { useEffect, useState } from "react";

interface MermaidCodeEditorProps {
  content: string;
  onChange: (content: string) => void;
  onPreviewChanges: () => void;
  onAcceptChanges: () => void;
  onRevert: () => void;
  onAiEdit?: () => void;
  disabled?: boolean;
  showPreviewButton?: boolean;
  canRevert?: boolean;
}

export default function MermaidCodeEditor({
  content,
  onChange,
  onPreviewChanges,
  onAcceptChanges,
  onRevert,
  onAiEdit,
  disabled = false,
  showPreviewButton = false,
  canRevert = false,
}: MermaidCodeEditorProps) {
  const [localContent, setLocalContent] = useState(content);
  const [lineCount, setLineCount] = useState(1);

  useEffect(() => {
    setLocalContent(content);
    setLineCount(content.split("\n").length);
  }, [content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setLocalContent(newContent);
    setLineCount(newContent.split("\n").length);
    onChange(newContent);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(localContent);
  };

  const handleDownload = () => {
    // Prompt user for filename
    const defaultName = `mermaid-diagram-${
      new Date().toISOString().split("T")[0]
    }`;
    const fileName = prompt("Enter filename (without extension):", defaultName);

    // If user cancels, don't proceed
    if (fileName === null) return;

    // Use provided name or fallback to default
    const finalFileName = fileName.trim() || defaultName;

    const svg = document.querySelector("#mermaid-editor-diagram svg");
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Scale factor for ultra-high resolution export (15x for maximum quality)
        const scaleFactor = 15;
        canvas.width = img.width * scaleFactor;
        canvas.height = img.height * scaleFactor;

        // Draw the image at the scaled size
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.download = `${finalFileName}.png`;
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
    <div className="bg-blue-50 dark:bg-secondary-dark rounded-3xl dark:border dark:shadow border-border overflow-hidden shadow-card-normal hover:shadow-card-hover focus-within:shadow-card-hover transition-all duration-300">
      <div className="flex items-center justify-between p-6 border-border">
        <h2 className="text-xl text-card-foreground opacity-65 ml-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
            <Code className="w-4 h-4 text-white" />
          </div>
          Mermaid Code Editor
        </h2>
        <div className="flex items-center gap-3">
          {showPreviewButton && (
            <>
              <button
                onClick={onAcceptChanges}
                className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 rounded-full hover:bg-green-700 transition-all duration-300 text-sm hover:scale-105"
              >
                <Check className="w-4 h-4" />
                Accept
              </button>
              <button
                onClick={onPreviewChanges}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all duration-300 text-sm hover:scale-105"
              >
                <CodeXml className="w-4 h-4" />
                Preview
              </button>
            </>
          )}
        </div>
      </div>

      <div className="p-6 translate-x-2">
        <div className="relative">
          {/* Code editor container with header */}
          <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700">
              <span className="text-xs font-medium text-gray-300">
                Mermaid Code Editor
              </span>
              <span className="text-xs text-gray-400">
                {lineCount} lines • {localContent.length} characters
              </span>
            </div>

            {/* Textarea */}
            <textarea
              value={localContent}
              onChange={handleChange}
              disabled={disabled}
              className="w-full h-96 p-4 bg-gray-800 text-sm resize-none outline-none border-none text-gray-200 placeholder:text-gray-500 transition-colors duration-300 font-mono leading-relaxed disabled:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Enter your Mermaid diagram code here...

Example:
graph TD
    A[Client] --> B[Load Balancer]
    B --> C[Server01]
    B --> D[Server02]"
              spellCheck={false}
            />
          </div>
        </div>

        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onRevert}
              disabled={!canRevert || disabled}
              className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-transparent dark:border dark:border-gray-700 hover:bg-red-500/70 hover:text-white dark:hover:bg-red-500/70 dark:hover:text-white text-red-500 dark:text-gray-300 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-125"
              title="Revert to previous state"
            >
              <Undo className="w-4 h-4" />
            </button>

            <button
              onClick={handleCopy}
              disabled={disabled}
              className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-transparent dark:border dark:border-gray-700 hover:bg-gradient-to-r hover:from-blue-500/50 hover:to-cyan-500/50 hover:text-white text-blue-700/60 dark:text-gray-300 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-125"
              title="Copy Mermaid code to clipboard"
            >
              <Copy className="w-4 h-4" />
            </button>

            <button
              onClick={handleDownload}
              disabled={disabled}
              className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-transparent dark:border dark:border-gray-700 hover:bg-gradient-to-r hover:from-blue-500/50 hover:to-cyan-500/50 hover:text-white text-blue-700/60 dark:text-gray-300 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-125"
              title="Download diagram as PNG image"
            >
              <Download className="w-4 h-4" />
            </button>
            {onAiEdit && (
              <button
                onClick={onAiEdit}
                disabled={disabled}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600/80 to-cyan-600/60 text-white rounded-full hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 text-sm hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Edit with AI"
              >
                <Sparkles className="w-4 h-4" />
                AI Edit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

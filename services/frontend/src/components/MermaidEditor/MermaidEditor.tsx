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

import { Check, Copy, Download, Eye, FileCode, Save, Undo } from "lucide-react";
import { useEffect, useState } from "react";

interface MermaidEditorProps {
  content: string;
  onChange: (content: string) => void;
  onPreviewChanges: () => void;
  onAcceptChanges: () => void;
  onRevert: () => void;
  onSave: () => void;
  disabled?: boolean;
  showPreviewButton?: boolean;
  canRevert?: boolean;
}

export default function MermaidEditor({
  content,
  onChange,
  onPreviewChanges,
  onAcceptChanges,
  onRevert,
  onSave,
  disabled = false,
  showPreviewButton = false,
  canRevert = false,
}: MermaidEditorProps) {
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
    const blob = new Blob([localContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mermaid-diagram-${
      new Date().toISOString().split("T")[0]
    }.mmd`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-card rounded-3xl dark:border dark:shadow border-border overflow-hidden shadow-card-normal hover:shadow-card-hover focus-within:shadow-card-hover transition-all duration-300">
      <div className="flex items-center justify-between p-6 border-border">
        <h2 className="text-xl text-card-foreground opacity-65 ml-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
            <FileCode className="w-4 h-4 text-white" />
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
                Accept & Render
              </button>
              <button
                onClick={onPreviewChanges}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all duration-300 text-sm hover:scale-105"
              >
                <Eye className="w-4 h-4" />
                Preview Changes
              </button>
            </>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="relative">
          <textarea
            value={localContent}
            onChange={handleChange}
            disabled={disabled}
            className="w-full h-96 p-4 dark:border bg-background text-sm rounded-2xl resize-none outline-none focus:shadow-[0_0_0_3px_rgba(59,130,246,0.3)] disabled:bg-muted disabled:cursor-not-allowed opacity-70 text-foreground placeholder:text-muted-foreground transition-all duration-300 font-mono"
            placeholder="Enter your Mermaid diagram code here...

Example:
graph TD
    A[Client] --> B[Load Balancer]
    B --> C[Server01]
    B --> D[Server02]"
            spellCheck={false}
          />
        </div>

        <div className="mt-3 space-y-3">
          <div className="text-xs text-muted-foreground ml-4 mb-6 opacity-65 flex items-center gap-4">
            <span>{localContent.length} characters</span>
            <span>{lineCount} lines</span>
          </div>

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
              className="flex items-center justify-center w-10 h-10 bg-blue-100/50 dark:bg-transparent dark:border dark:border-gray-700 hover:bg-gradient-to-r hover:from-blue-500/50 hover:to-cyan-500/50 hover:text-white text-blue-700/60 dark:text-gray-300 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-125"
              title="Copy Mermaid code to clipboard"
            >
              <Copy className="w-4 h-4" />
            </button>

            <button
              onClick={onSave}
              disabled={disabled}
              className="flex items-center justify-center w-10 h-10 bg-blue-100/50 dark:bg-transparent dark:border dark:border-gray-700 hover:bg-gradient-to-r hover:from-blue-500/50 hover:to-cyan-500/50 hover:text-white text-blue-700/60 dark:text-gray-300 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-125"
              title="Save Mermaid code locally"
            >
              <Save className="w-4 h-4" />
            </button>

            <button
              onClick={handleDownload}
              disabled={disabled}
              className="flex items-center justify-center w-10 h-10 bg-blue-100/50 dark:bg-transparent dark:border dark:border-gray-700 hover:bg-gradient-to-r hover:from-blue-500/50 hover:to-cyan-500/50 hover:text-white text-blue-700/60 dark:text-gray-300 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-125"
              title="Download Mermaid code as .mmd file"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

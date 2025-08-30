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
import { diffChars } from "diff";
import { useEffect, useState } from "react";
import MermaidDiffViewer from "./MermaidDiffViewer";
import MermaidEditor from "./MermaidEditor";

interface MermaidEditorPanelProps {
  diagram: Diagram | null;
  onDiagramUpdate: (updatedDiagram: Diagram) => void;
  onClose?: () => void;
  isDarkMode?: boolean;
}

export default function MermaidEditorPanel({
  diagram,
  onDiagramUpdate,
  onClose,
  isDarkMode = false,
}: MermaidEditorPanelProps) {
  const [originalContent, setOriginalContent] = useState("");
  const [proposedContent, setProposedContent] = useState("");
  const [diffResult, setDiffResult] = useState<any[]>([]);
  const [showDiff, setShowDiff] = useState(false);
  const [editMode] = useState<"direct" | "llm">("direct");
  const [mermaidHistory, setMermaidHistory] = useState<string[]>([]);
  const [mermaidLoaded, setMermaidLoaded] = useState(false);

  // Initialize with diagram content
  useEffect(() => {
    if (diagram?.diagram_code) {
      const cleanedCode = cleanMermaidCode(diagram.diagram_code);
      setOriginalContent(cleanedCode);
      setMermaidHistory([cleanedCode]);
    }
  }, [diagram]);

  // Initialize Mermaid
  useEffect(() => {
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

  // Re-render diagram when original content changes
  useEffect(() => {
    if (mermaidLoaded && originalContent) {
      renderDiagram(originalContent);
    }
  }, [originalContent, mermaidLoaded]);

  const renderDiagram = async (code: string) => {
    try {
      const mermaid = (await import("mermaid")).default;
      const element = document.getElementById("mermaid-editor-diagram");
      if (element) {
        // Clear previous content
        element.innerHTML = "";

        // Clean and validate the diagram code
        const cleanChart = cleanMermaidCode(code);
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
      const element = document.getElementById("mermaid-editor-diagram");
      if (element) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        const cleanChart = cleanMermaidCode(code);
        element.innerHTML = `
          <div class="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
            <p class="text-red-600 dark:text-red-400 text-sm font-medium">Failed to render diagram</p>
            <p class="text-red-500 dark:text-red-300 text-xs mt-1">${errorMessage}</p>
            <details class="mt-2">
              <summary class="text-xs text-gray-600 dark:text-gray-400 cursor-pointer">View code</summary>
              <pre class="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto"><code>${cleanChart}</code></pre>
            </details>
          </div>
        `;
      }
    }
  };

  const handleDirectEdit = (newContent: string) => {
    setProposedContent(newContent);
  };

  const handlePreviewChanges = () => {
    if (proposedContent && proposedContent !== originalContent) {
      // Show diff viewer
      const diff = diffChars(originalContent, proposedContent);
      setDiffResult(diff);
      setShowDiff(true);
    }
  };

  const handleAcceptChanges = () => {
    const newContent = proposedContent || originalContent;
    setOriginalContent(newContent);
    setMermaidHistory((prev) => [...prev, newContent]);
    setProposedContent("");
    setDiffResult([]);
    setShowDiff(false);

    // Update the diagram object and notify parent
    if (diagram) {
      const updatedDiagram: Diagram = {
        ...diagram,
        diagram_code: newContent,
      };
      onDiagramUpdate(updatedDiagram);
    }
  };

  const handleRejectChanges = () => {
    setProposedContent("");
    setDiffResult([]);
    setShowDiff(false);
  };

  const handleRevert = () => {
    if (mermaidHistory.length > 1) {
      const newHistory = [...mermaidHistory];
      newHistory.pop(); // Remove current state
      const previousState = newHistory[newHistory.length - 1];

      setOriginalContent(previousState);
      setProposedContent("");
      setMermaidHistory(newHistory);
      setShowDiff(false);

      // Update the diagram object
      if (diagram) {
        const updatedDiagram: Diagram = {
          ...diagram,
          diagram_code: previousState,
        };
        onDiagramUpdate(updatedDiagram);
      }
    }
  };

  const handleSave = () => {
    const currentContent = proposedContent || originalContent;
    const blob = new Blob([currentContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${
      diagram?.title?.toLowerCase().replace(/\s+/g, "-") || "mermaid-diagram"
    }-${new Date().toISOString().split("T")[0]}.mmd`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!diagram || !diagram.diagram_code) {
    return (
      <div className="p-4 text-center text-gray-500">
        No diagram available for editing
      </div>
    );
  }

  return (
    <div className="w-[95vw] max-w-7xl h-[90vh] bg-blue-50 dark:bg-secondary-dark rounded-2xl shadow-2xl overflow-y-auto transition-colors duration-300">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center py-2 relative">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-2 right-2 p-2 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
              title="Close Editor"
            >
              <svg
                className="w-5 h-5"
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
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Mermaid Editor
            </span>
          </h1>
          <p className="text-muted-foreground mb-2 text-sm">
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Edit Mermaid code with live preview and diff approval
            </span>
          </p>
          {diagram.title && (
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
              {diagram.title}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor Section */}
          <div className="space-y-6">
            <MermaidEditor
              content={
                showDiff ? originalContent : proposedContent || originalContent
              }
              onChange={handleDirectEdit}
              onPreviewChanges={handlePreviewChanges}
              onAcceptChanges={handleAcceptChanges}
              onRevert={handleRevert}
              onSave={handleSave}
              disabled={showDiff}
              showPreviewButton={
                proposedContent !== originalContent &&
                proposedContent !== "" &&
                !showDiff
              }
              canRevert={mermaidHistory.length > 1}
            />
          </div>

          {/* Right Panel - Diff Viewer */}
          <div className="relative">
            {/* Diff Viewer */}
            <div
              className={`transition-all duration-700 ease-in-out ${
                showDiff
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-4 pointer-events-none"
              }`}
            >
              {showDiff && (
                <MermaidDiffViewer
                  diffResult={diffResult}
                  onAccept={handleAcceptChanges}
                  onReject={handleRejectChanges}
                  editMode={editMode}
                />
              )}
            </div>

            {/* Info Panel */}
            {!showDiff && (
              <div className="bg-card rounded-3xl dark:border dark:shadow border-border overflow-hidden shadow-card-normal hover:shadow-card-hover transition-shadow duration-300 p-6">
                <h3 className="text-lg font-semibold mb-4 opacity-65">
                  Editor Instructions
                </h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>• Edit the Mermaid code in the editor panel</p>
                  <p>• Click "Preview Changes" to see what will change</p>
                  <p>• Accept changes to update the diagram</p>
                  <p>• Use the diagram preview below to see live results</p>
                  <p>• Revert button undoes the last accepted change</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Diagram Preview */}
        <div className="bg-card rounded-3xl dark:border dark:shadow border-border overflow-hidden shadow-card-normal hover:shadow-card-hover transition-shadow duration-300 p-6">
          <h3 className="text-lg font-semibold mb-4 text-center opacity-65">
            Live Diagram Preview
          </h3>
          <div
            id="mermaid-editor-diagram"
            className="w-full overflow-auto flex items-center justify-center bg-white dark:bg-gray-800 rounded-2xl p-6"
            style={{ minHeight: "300px" }}
          >
            {!mermaidLoaded && (
              <div className="flex items-center justify-center h-32">
                <div className="text-gray-500">Loading diagram...</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

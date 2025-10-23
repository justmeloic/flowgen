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

import { DiffEditor } from "@monaco-editor/react";
import { ChevronDown, ChevronUp, Edit, Sparkles } from "lucide-react";
import type { editor } from "monaco-editor";
import { useEffect, useRef, useState } from "react";

interface DiffViewerProps {
  originalContent: string;
  modifiedContent: string;
  onAccept: () => void;
  onReject: () => void;
  editMode: "direct" | "llm";
  isDarkMode?: boolean;
}

export default function DiffViewer({
  originalContent,
  modifiedContent,
  onAccept,
  onReject,
  editMode,
  isDarkMode = true,
}: DiffViewerProps) {
  const [hasChanges, setHasChanges] = useState(false);
  const [changeStats, setChangeStats] = useState({
    additions: 0,
    deletions: 0,
  });
  const [viewMode, setViewMode] = useState<"inline" | "split">("split");
  const diffEditorRef = useRef<editor.IStandaloneDiffEditor | null>(null);

  // Define custom diff colors
  const defineCustomTheme = (monaco: any) => {
    monaco.editor.defineTheme("custom-light", {
      base: "vs",
      inherit: true,
      rules: [],
      colors: {
        "diffEditor.insertedTextBackground": "#22c55e80", // Brighter green for additions
        "diffEditor.removedTextBackground": "#ef444480", // Brighter red for deletions
        "diffEditor.insertedLineBackground": "#22c55e30", // Light green for line
        "diffEditor.removedLineBackground": "#ef444430", // Light red for line
      },
    });

    monaco.editor.defineTheme("custom-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "diffEditor.insertedTextBackground": "#22c55e60", // Brighter dark mode green
        "diffEditor.removedTextBackground": "#ef444460", // Brighter dark mode red
        "diffEditor.insertedLineBackground": "#22c55e30",
        "diffEditor.removedLineBackground": "#ef444430",
      },
    });
  };

  useEffect(() => {
    // Check if there are actual changes
    setHasChanges(originalContent !== modifiedContent);

    // Calculate proper line-based diff stats
    if (originalContent !== modifiedContent) {
      const originalLines = originalContent.split("\n");
      const modifiedLines = modifiedContent.split("\n");

      // Use a simple LCS (Longest Common Subsequence) based approach
      const { additions, deletions } = calculateLineDiff(
        originalLines,
        modifiedLines
      );

      setChangeStats({ additions, deletions });
    } else {
      setChangeStats({ additions: 0, deletions: 0 });
    }
  }, [originalContent, modifiedContent]);

  // Calculate line-based diff using a simple algorithm
  const calculateLineDiff = (
    originalLines: string[],
    modifiedLines: string[]
  ) => {
    const originalSet = new Set(originalLines);
    const modifiedSet = new Set(modifiedLines);

    // Count lines that exist in modified but not in original (additions)
    let additions = 0;
    const originalLineCount: Record<string, number> = {};
    const modifiedLineCount: Record<string, number> = {};

    // Count occurrences in original
    originalLines.forEach((line) => {
      originalLineCount[line] = (originalLineCount[line] || 0) + 1;
    });

    // Count occurrences in modified
    modifiedLines.forEach((line) => {
      modifiedLineCount[line] = (modifiedLineCount[line] || 0) + 1;
    });

    // Calculate additions (lines added or increased count)
    Object.keys(modifiedLineCount).forEach((line) => {
      const modCount = modifiedLineCount[line];
      const origCount = originalLineCount[line] || 0;
      if (modCount > origCount) {
        additions += modCount - origCount;
      }
    });

    // Calculate deletions (lines removed or decreased count)
    let deletions = 0;
    Object.keys(originalLineCount).forEach((line) => {
      const origCount = originalLineCount[line];
      const modCount = modifiedLineCount[line] || 0;
      if (origCount > modCount) {
        deletions += origCount - modCount;
      }
    });

    return { additions, deletions };
  };

  const handleEditorDidMount = (editor: editor.IStandaloneDiffEditor) => {
    diffEditorRef.current = editor;
    console.log("Monaco Diff Editor mounted", editor);
  };

  // Watch for viewMode changes and update Monaco
  useEffect(() => {
    console.log("ViewMode changed to:", viewMode);
    if (diffEditorRef.current) {
      console.log("Updating Monaco editor options...");
      try {
        diffEditorRef.current.updateOptions({
          renderSideBySide: viewMode === "split",
        });
        // Force layout recalculation
        setTimeout(() => {
          if (diffEditorRef.current) {
            diffEditorRef.current.layout();
            console.log("Monaco layout updated");
          }
        }, 100);
      } catch (error) {
        console.error("Error updating Monaco options:", error);
      }
    } else {
      console.warn("Diff editor ref not available for view mode change");
    }
  }, [viewMode]);

  const goToNextChange = () => {
    console.log("Going to next change");
    if (diffEditorRef.current) {
      try {
        const modifiedEditor = diffEditorRef.current.getModifiedEditor();
        const action = modifiedEditor.getAction(
          "editor.action.diffReview.next"
        );
        if (action) {
          action.run();
        } else {
          console.warn("Next change action not found");
        }
      } catch (error) {
        console.error("Error navigating to next change:", error);
      }
    } else {
      console.warn("Diff editor ref not available");
    }
  };

  const goToPreviousChange = () => {
    console.log("Going to previous change");
    if (diffEditorRef.current) {
      try {
        const modifiedEditor = diffEditorRef.current.getModifiedEditor();
        const action = modifiedEditor.getAction(
          "editor.action.diffReview.prev"
        );
        if (action) {
          action.run();
        } else {
          console.warn("Previous change action not found");
        }
      } catch (error) {
        console.error("Error navigating to previous change:", error);
      }
    } else {
      console.warn("Diff editor ref not available");
    }
  };

  const toggleViewMode = () => {
    console.log(
      "Toggling view mode from",
      viewMode,
      "to",
      viewMode === "split" ? "inline" : "split"
    );
    const newMode = viewMode === "split" ? "inline" : "split";
    setViewMode(newMode);
    console.log("View mode state updated to:", newMode);
  };

  return (
    <div className="bg-card rounded-3xl dark:border dark:shadow border-border overflow-hidden shadow-card-normal hover:shadow-card-hover transition-shadow duration-300 ease-in-out">
      <div className="p-6 border-border">
        <h2 className="text-xl opacity-65 ml-4 text-card-foreground flex items-center gap-3">
          {editMode === "llm" ? (
            <>
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              AI Suggested Changes
            </>
          ) : (
            <>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <Edit className="w-4 h-4 text-white" />
              </div>
              Direct Edit Changes
            </>
          )}
        </h2>
      </div>

      <div className="p-6">
        {hasChanges ? (
          <>
            <div className="mb-6 p-4 bg-blue-100/50 dark:bg-blue-950/20 rounded-2xl relative z-10">
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-6">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="font-medium">Removed</span>
                      <span className="text-xs bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
                        {changeStats.deletions}
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-medium">Added</span>
                      <span className="text-xs bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                        {changeStats.additions}
                      </span>
                    </span>
                  </div>

                  {/* Navigation and View Controls */}
                  <div className="flex items-center gap-2 relative z-20">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("Toggle view clicked");
                        toggleViewMode();
                      }}
                      className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-full transition-colors cursor-pointer select-none"
                      title={`Switch to ${
                        viewMode === "split" ? "inline" : "split"
                      } view`}
                    >
                      {viewMode === "split" ? "Inline" : "Split"}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("Previous change clicked");
                        goToPreviousChange();
                      }}
                      className="p-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-full transition-colors cursor-pointer select-none"
                      title="Previous change"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("Next change clicked");
                        goToNextChange();
                      }}
                      className="p-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-full transition-colors cursor-pointer select-none"
                      title="Next change"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-blue-700 dark:text-blue-300">
                  Review the Mermaid code changes below and choose to accept or
                  reject them.
                </p>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <DiffEditor
                height="400px"
                language="mermaid"
                original={originalContent}
                modified={modifiedContent}
                theme={isDarkMode ? "custom-dark" : "custom-light"}
                beforeMount={defineCustomTheme}
                onMount={handleEditorDidMount}
                options={{
                  readOnly: true,
                  renderSideBySide: viewMode === "split",
                  enableSplitViewResizing: true,
                  diffWordWrap: "on",
                  diffAlgorithm: "advanced",
                  ignoreTrimWhitespace: false,
                  renderIndicators: true,
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>

            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={onAccept}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-full font-medium transition-colors text-sm"
              >
                Accept
              </button>
              <button
                onClick={onReject}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white hover:bg-gray-50 text-red-600 border-2 border-red-200 rounded-full font-medium transition-colors text-sm"
              >
                Reject
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground shadow-md rounded-lg">
            <div className="text-5xl mb-4">🤔</div>
            <p className="text-lg font-medium">No changes detected</p>
            <p className="text-sm mt-2">
              The Mermaid code appears to be identical
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

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

interface DiagramCodeViewerProps {
  diagram: Diagram;
  isVisible: boolean;
}

export function DiagramCodeViewer({
  diagram,
  isVisible,
}: DiagramCodeViewerProps) {
  if (!isVisible || !diagram?.diagram_code) {
    return null;
  }

  const cleanedCode = cleanMermaidCode(diagram.diagram_code);
  const lineCount = cleanedCode.split("\n").length;

  return (
    <div className="mt-4">
      <div className="bg-gray-800 mx-64 rounded-xl border border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-gray-900 border-b border-gray-700">
          <span className="text-xs font-medium text-gray-300">
            Mermaid Code
          </span>
          <span className="text-xs text-gray-400">{lineCount} lines</span>
        </div>
        <pre className="p-3 overflow-auto max-h-48 bg-gray-800">
          <code className="text-xs font-mono text-gray-200 leading-relaxed">
            {cleanedCode}
          </code>
        </pre>
      </div>
    </div>
  );
}

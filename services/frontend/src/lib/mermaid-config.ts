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

import mermaid from "mermaid";

/**
 * Default Mermaid configuration for consistent theming across the application
 */
export const DEFAULT_MERMAID_CONFIG = {
  startOnLoad: false,
  theme: "default" as const,
  securityLevel: "loose" as const,
  fontFamily: "Arial, sans-serif",
  fontSize: 14,
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
    curve: "basis" as const,
  },
  themeVariables: {
    primaryColor: "#3b82f6",
    primaryTextColor: "#1f2937",
    primaryBorderColor: "#2563eb",
    lineColor: "#6b7280",
    secondaryColor: "#e5e7eb",
    tertiaryColor: "#f3f4f6",
    background: "#ffffff",
    mainBkg: "#ffffff",
    secondBkg: "#f9fafb",
    tertiaryBkg: "#f3f4f6",
  },
};

/**
 * Dark mode Mermaid configuration
 */
export const DARK_MERMAID_CONFIG = {
  ...DEFAULT_MERMAID_CONFIG,
  theme: "dark" as const,
  themeVariables: {
    primaryColor: "#60a5fa",
    primaryTextColor: "#f9fafb",
    primaryBorderColor: "#3b82f6",
    lineColor: "#9ca3af",
    secondaryColor: "#374151",
    tertiaryColor: "#1f2937",
    background: "#111827",
    mainBkg: "#1f2937",
    secondBkg: "#374151",
    tertiaryBkg: "#4b5563",
  },
};

/**
 * Initialize Mermaid with the default configuration
 */
export const initializeMermaid = async (isDarkMode = false) => {
  try {
    const config = isDarkMode ? DARK_MERMAID_CONFIG : DEFAULT_MERMAID_CONFIG;
    await mermaid.initialize(config);
    return true;
  } catch (error) {
    console.error("Failed to initialize Mermaid:", error);
    return false;
  }
};

/**
 * Clean Mermaid code by removing markdown markers, invalid content, and excess whitespace
 */
export const cleanMermaidCode = (code: string): string => {
  let cleaned = code
    .replace(/```mermaid\n?/, '')
    .replace(/```$/, '')
    .trim();

  // Split into lines for processing
  const lines = cleaned.split('\n');
  const validLines: string[] = [];
  let inValidMermaidSection = false;
  let foundDiagramType = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines at the beginning until we find a diagram type
    if (!foundDiagramType && !line) {
      continue;
    }

    // Check for diagram type declarations
    const diagramTypes = ['graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram', 'gantt', 'pie', 'journey', 'gitgraph', 'mindmap', 'timeline'];
    const isDiagramType = diagramTypes.some(type => line.toLowerCase().startsWith(type.toLowerCase()));
    
    if (isDiagramType) {
      foundDiagramType = true;
      inValidMermaidSection = true;
      validLines.push(lines[i]); // Keep original formatting
      continue;
    }

    // If we haven't found a diagram type yet, skip this line
    if (!foundDiagramType) {
      continue;
    }

    // Handle comment lines - only keep single-line comments that start with %%
    if (line.startsWith('%%')) {
      // Only keep single-line comments, not multi-line descriptions
      if (line.length < 100 && !line.includes('\n')) {
        validLines.push(lines[i]);
      }
      continue;
    }

    // Skip lines that look like prose/descriptions (common indicators)
    const proseIndicators = [
      /^(Description|Components|Flow|The |This |A |An )/i,
      /\d+\.\s/, // Numbered lists
      /^-\s/, // Bullet points
      /^(User|Web|Backend|Database|JWT|Authentication)/i, // Common description starters
      /\b(communicates|handles|interacts|includes|validates|stores|displays|queries|updates|issues|sends)\b/i
    ];
    
    const isProse = proseIndicators.some(pattern => pattern.test(line));
    if (isProse && !line.includes('-->') && !line.includes('->') && !line.includes('[') && !line.includes(']')) {
      continue;
    }

    // Keep valid Mermaid syntax lines
    if (inValidMermaidSection) {
      // Check if this looks like a valid Mermaid line
      const mermaidPatterns = [
        /-->/,  // arrows
        /->/,   // arrows
        /\[.*\]/, // node labels
        /\{.*\}/, // decision nodes
        /\(.*\)/, // rounded nodes
        /subgraph/, // subgraphs
        /end$/, // end statements
        /class\s/, // class definitions
        /style\s/, // style definitions
        /click\s/, // click events
      ];
      
      const isMermaidSyntax = mermaidPatterns.some(pattern => pattern.test(line));
      const isNodeDefinition = /^[A-Za-z0-9_]+(\[.*\]|\(.*\)|\{.*\})?$/.test(line);
      
      if (isMermaidSyntax || isNodeDefinition || !line) {
        validLines.push(lines[i]); // Keep original formatting
      }
    }
  }

  return validLines.join('\n').trim();
};

/**
 * Generate a unique ID for Mermaid diagrams
 */
export const generateMermaidId = (): string => {
  return `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Validate basic Mermaid syntax
 */
export const validateMermaidSyntax = (code: string): { isValid: boolean; error?: string } => {
  const cleaned = cleanMermaidCode(code);
  
  if (!cleaned) {
    return { isValid: false, error: "Empty diagram code after cleaning" };
  }

  // Check for common diagram types
  const diagramTypes = ['graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram', 'gantt', 'pie', 'journey', 'gitgraph', 'mindmap', 'timeline'];
  const hasValidType = diagramTypes.some(type => cleaned.toLowerCase().includes(type.toLowerCase()));
  
  if (!hasValidType) {
    return { isValid: false, error: "No valid diagram type found" };
  }

  // Check for common syntax issues
  const lines = cleaned.split('\n').filter(line => line.trim());
  
  // Look for problematic patterns that often cause parse errors
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip comments and empty lines
    if (!trimmedLine || trimmedLine.startsWith('%%')) {
      continue;
    }
    
    // Check for prose mixed in with diagram code
    const prosePattern = /^[A-Z][a-z\s,\.]+[a-z]\.?\s*$/;
    if (prosePattern.test(trimmedLine) && !trimmedLine.includes('[') && !trimmedLine.includes(']')) {
      return { 
        isValid: false, 
        error: `Found prose text in diagram: "${trimmedLine.substring(0, 50)}..."` 
      };
    }
  }

  return { isValid: true };
};

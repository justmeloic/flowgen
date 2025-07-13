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

import type React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  code: string;
  language: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  return (
    <SyntaxHighlighter
      language={language}
      style={tomorrow}
      customStyle={{
        borderRadius: "20px", // Adjust as needed
        overflow: "hidden", // Essential for rounded corners
        padding: "1em", // Add some padding for better aesthetics
        margin: 0, // remove margin.
      }}
      codeTagProps={{
        style: {
          display: "inline-block", // Very important for correct display
          fontFamily: "inherit", // Inherit font family for consistency
        },
      }}
      wrapLines={true}
      showLineNumbers={true} // Add line numbers (optional, but handle styling)
      lineNumberContainerStyle={{
        borderTopLeftRadius: "8px",
        borderBottomLeftRadius: "8px",
        overflow: "hidden",
        display: "inline-block",
        paddingRight: "1em", // Add some padding for separation
      }}
    >
      {code}
    </SyntaxHighlighter>
  );
};

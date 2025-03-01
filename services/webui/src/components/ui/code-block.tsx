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

import { Loader2, SendHorizontal, Sparkles, X } from "lucide-react";
import React, { useState } from "react";

interface PromptCardProps {
  onSubmit: (prompt: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function PromptCard({
  onSubmit,
  onCancel,
  isLoading = false,
  disabled = false,
}: PromptCardProps) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading && !disabled) {
      onSubmit(prompt.trim());
      setPrompt("");
    }
  };

  const suggestedPrompts = [
    "Add error handling and validation steps",
    "Convert to a sequence diagram",
    "Add more detail to the API layer",
    "Make it a class diagram instead",
    "Add database interactions",
    "Include user authentication flow",
  ];

  return (
    <div className="bg-card rounded-3xl dark:border dark:shadow-none border-border overflow-hidden shadow-card-normal hover:shadow-card-hover focus-within:shadow-card-hover transition-shadow duration-300 ease-in-out">
      <div className="flex items-center justify-between p-6 border-border">
        <h2 className="text-xl opacity-65 text-card-foreground flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>
          AI Mode
        </h2>
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center animate-bounce">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            </div>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe how you'd like to modify the diagram..."
                  className="w-full h-24 p-4 pb-12 bg-background border border-input rounded-2xl resize-none outline-none focus:shadow-[0_0_0_3px_rgba(59,130,246,0.3)] disabled:bg-muted text-sm text-foreground/65 placeholder:text-muted-foreground transition-all duration-300"
                  disabled={isLoading || disabled}
                  autoFocus
                />
                {prompt.trim() && (
                  <button
                    type="submit"
                    disabled={isLoading || disabled}
                    className="absolute bottom-4 right-4 flex items-center justify-center w-7 h-7 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <SendHorizontal className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </form>

            <div className="mt-6">
              <p className="text-sm text-muted-foreground mb-3 opacity-75">
                Quick suggestions:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestedPrompts.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(suggestion)}
                    disabled={isLoading || disabled}
                    className="px-3 py-2 text-xs bg-secondary dark:bg-transparent dark:border dark:border-gray-700 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-600/20 dark:hover:to-pink-600/20 hover:text-purple-700 dark:hover:text-gray-200 hover:border-purple-200 dark:hover:border-gray-600 text-secondary-foreground dark:text-gray-400 rounded-full border border-border disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out transform hover:scale-105"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-2xl">
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-2">💡 Tips for better results:</p>
                <ul className="space-y-1 text-xs opacity-75">
                  <li>• Be specific about what you want to change</li>
                  <li>
                    • Mention diagram types (flowchart, sequence, class, etc.)
                  </li>
                  <li>• Describe new components or relationships to add</li>
                  <li>• Ask for structural improvements or corrections</li>
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { ChatInput } from "@/components/chat-input";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { ModelSelector } from "@/components/model-selector";
import { MessageActions } from "@/components/message-actions";
import { Toaster } from "@/components/ui/toaster";
import Link from "next/link";
import { createSession, sendMessage } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
interface ChatMessage {
  role: "user" | "bot";
  content: string;
}

export default function ChatPage() {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isFirstPrompt, setIsFirstPrompt] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Thinking...");
  const [sessionInitialized, setSessionInitialized] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      const scrollHeight = chatContainerRef.current.scrollHeight;
      const height = chatContainerRef.current.clientHeight;
      const maxScrollTop = scrollHeight - height;
      chatContainerRef.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }
  }, []);

  useEffect(() => {
    const initSession = async () => {
      try {
        const existingUserId = localStorage.getItem("chatUserId");
        const existingSessionId = localStorage.getItem("chatSessionId");

        if (!existingUserId || !existingSessionId) {
          await createSession();
        }
        setSessionInitialized(true);
      } catch (error) {
        console.error("Failed to initialize session:", error);
        toast({
          title: "Error",
          description:
            "Failed to initialize chat session. Please refresh the page.",
          variant: "destructive",
        });
      }
    };

    initSession();
  }, []);

  useEffect(() => {
    if (isLoading) {
      const intervalId = setInterval(() => {
        setLoadingText((prevText) =>
          prevText === "Generating..." ? "Thinking..." : "Generating..."
        );
      }, 1000); // Adjusted to match the intended "Thinking..." / "Generating..." toggle
      return () => clearInterval(intervalId);
    }
  }, [isLoading]);

  const handleSend = useCallback(
    async (userMessage: string, _botMessage: string) => { // _botMessage seems unused here
      if (!sessionInitialized) {
         toast({
          title: "Session Not Ready",
          description: "Please wait for the chat session to initialize.",
          variant: "default",
        });
        return;
      }
      if (isFirstPrompt) {
        setIsFirstPrompt(false);
      }
      setIsLoading(true);
      // Show user message and a temporary loading message for the bot
      setChatHistory((prev) => [
        ...prev,
        { role: "user", content: userMessage },
        { role: "bot", content: loadingText }, // Use the current loadingText state
      ]);
      setTimeout(scrollToBottom, 0); // Scroll immediately after adding messages

      try {
        const response = await sendMessage(userMessage);
        setChatHistory((prev) => {
          const newHistory = [...prev];
          // Replace the last message (which was the loading message) with the actual bot response
          if (newHistory.length > 0 && newHistory[newHistory.length -1].role === 'bot') {
            newHistory[newHistory.length - 1] = { role: "bot", content: response.response };
          } else {
            // This case should ideally not happen if logic is correct
            newHistory.push({ role: "bot", content: response.response });
          }
          return newHistory;
        });
        setTimeout(scrollToBottom, 100); // Scroll after bot response is set
      } catch (error) {
        console.error("Error sending message:", error);
        setChatHistory((prev) =>
          prev.slice(0, -1).concat({ role: "bot", content: "Sorry, I encountered an error. Please try again." })
        );
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [scrollToBottom, isFirstPrompt, loadingText, sessionInitialized] // Added sessionInitialized
  );

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, scrollToBottom]); // Also scroll when chatHistory updates

  return (
    <div className="flex flex-col flex-1 h-full">
      <div className="flex items-center justify-between p-4 border-b"> {/* Added border-b for separation */}
        <ModelSelector />
        <Link href="/" className="flex h-8 w-8 items-center justify-center">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            stroke="currentColor" // Changed to currentColor to inherit text color
            strokeWidth="2" // Standard stroke width
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 text-gray-900 dark:text-gray-100" // Added dark mode compatibility
          >
            <path d="M3 10L12 3L21 10V20H14V14H10V20H3V10Z" />
          </svg>
        </Link>
        {/* Placeholder for alignment, consider a more semantic approach if possible */}
        <div className="w-[180px]" />
      </div>
      <main className="flex-1 flex flex-col items-center w-full relative overflow-hidden"> {/* Added overflow-hidden */}
        <div
          ref={chatContainerRef}
          className="flex-1 w-full max-w-[700px] mb-8 mx-auto px-4 pb-4 overflow-y-auto" // Slightly increased max-width
          style={{
            // Consider using Tailwind classes for height if possible, or ensure this calc is robust
            height: "calc(100vh - 160px)", // Adjusted calculation based on typical header/footer heights
            maxHeight: "calc(100vh - 160px)",
          }}
        >
          {isFirstPrompt && chatHistory.length === 0 ? ( // Ensure history is empty too
            <div className="flex items-center justify-center h-full">
              <h1 className="text-center text-4xl md:text-5xl font-bold"> {/* Responsive text size */}
                <span className="bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent"> {/* Adjusted gradient */}
                  Hello, Loïc
                </span>
              </h1>
            </div>
          ) : (
            <div className="w-full space-y-4 py-8">
              {chatHistory.map((message, index) => (
                <div
                  key={index}
                  className={`flex flex-col ${
                    message.role === "user" ? "items-end" : "items-start"
                  } mb-4`}
                >
                  <div className={`flex items-start gap-2.5 max-w-[85%] md:max-w-[80%]`}> {/* Adjusted gap and max-width */}
                    {message.role === "bot" && (
                      <Avatar className="w-8 h-8 shrink-0"> {/* Added shrink-0 */}
                        <AvatarImage
                          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-avatar-icon-sp2bKzW5OCu4C1f64jSvrbY0bgCc8M.png"
                          alt="Bot Avatar"
                        />
                      </Avatar>
                    )}
                    <div
                      className={`prose prose-sm max-w-none inline-block p-3 px-4 rounded-2xl ${ // Added prose classes for markdown styling
                        message.role === "user"
                          ? "bg-blue-500 text-white rounded-tr-none dark:bg-blue-600" // Adjusted user bubble style
                          : "bg-gray-100 text-gray-800 rounded-tl-none dark:bg-gray-700 dark:text-gray-200" // Adjusted bot bubble style
                      }`}
                    >
                      {message.role === "bot" ? (
                        // The loading animation for bot messages needs careful handling
                        isLoading && message.content === loadingText && index === chatHistory.length - 1 ? (
                           <span className="italic">{loadingText}</span> // Display loading text directly
                        ) : (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{ // Optional: Custom renderers for specific markdown elements
                              // Example: Customizing links
                              // a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400" />
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        )
                      ) : (
                        message.content // User messages as plain text
                      )}
                    </div>
                  </div>
                  {/* Message Actions: ensure it's only for the very last bot message and not a loading one */}
                  {message.role === "bot" &&
                    index === chatHistory.length - 1 &&
                    !(isLoading && message.content === loadingText) && ( // Don't show actions for loading message
                      <div className="ml-10 mt-2">
                        <MessageActions message={message.content} />
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="w-full max-w-[700px] mx-auto sticky bottom-0 bg-white dark:bg-gray-800 py-3 px-4 border-t dark:border-gray-700"> {/* Made chat input sticky */}
          <ChatInput onSend={handleSend} isLoading={isLoading} disabled={!sessionInitialized} /> {/* Disable input if session not ready */}
        </div>
      </main>
      <Toaster />
    </div>
  );
}

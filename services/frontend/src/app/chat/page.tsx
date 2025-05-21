"use client";

import * as React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { ChatInput } from "@/components/chat-input";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { ModelSelector } from "@/components/model-selector";
import { MessageActions } from "@/components/message-actions";
import { Toaster } from "@/components/ui/toaster";
import Link from "next/link";
import { sendMessage } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkParse from "remark-parse";
import { ReferencesPanel } from "@/components/references-panel";

interface ChatMessage {
  role: "user" | "bot";
  content: string;
}

interface Reference {
  id: string;
  name: string;
  title: string;
  link: string;
}

export default function ChatPage() {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [references, setReferences] = useState<{ [key: string]: Reference }>(
    {}
  );
  const [isFirstPrompt, setIsFirstPrompt] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Thinking...");
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
    async (userMessage: string, _botMessage: string) => {
      if (isFirstPrompt) {
        setIsFirstPrompt(false);
      }
      setIsLoading(true);
      setChatHistory((prev) => [
        ...prev,
        { role: "user", content: userMessage },
        { role: "bot", content: loadingText },
      ]);
      setTimeout(scrollToBottom, 0);

      try {
        const response = await sendMessage(userMessage);

        // Update references with the new references from the response
        setReferences(response.references || {});

        setChatHistory((prev) => {
          const newHistory = [...prev];
          if (
            newHistory.length > 0 &&
            newHistory[newHistory.length - 1].role === "bot"
          ) {
            newHistory[newHistory.length - 1] = {
              role: "bot",
              content: response.response,
            };
          } else {
            newHistory.push({ role: "bot", content: response.response });
          }
          return newHistory;
        });
        setTimeout(scrollToBottom, 100);
      } catch (error) {
        console.error("Error sending message:", error);
        setChatHistory((prev) =>
          prev
            .slice(0, -1)
            .concat({
              role: "bot",
              content: "Sorry, I encountered an error. Please try again.",
            })
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
    [scrollToBottom, isFirstPrompt, loadingText]
  );

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, scrollToBottom]); // Also scroll when chatHistory updates

  return (
    <div className="flex flex-col flex-1 h-full">
      <div className="flex items-center justify-between  border-b">
        <ModelSelector />
        <Link href="/" className="flex h-8 w-8 items-center justify-center">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 text-gray-900 dark:text-gray-100"
          >
            <path d="M3 10L12 3L21 10V20H14V14H10V20H3V10Z" />
          </svg>
        </Link>
        <div className="w-[180px]" />
      </div>
      <div className="flex flex-1 overflow-hidden">
        {/* Main Chat Area */}
        <main
          className={`flex-1 flex flex-col items-center w-full relative overflow-hidden h-[calc(100vh-11rem)] transition-all duration-1700 ease-in-out ${
            Object.keys(references).length > 0 ? "mr-80" : ""
          }`}
        >
          <div
            ref={chatContainerRef}
            className="flex-1 w-full max-w-[700px] mb-8 mx-auto px-4 pb-4 overflow-y-auto"
            style={{
              height: "calc(100vh - 10rem)",
              maxHeight: "calc(100vh - 10rem)",
            }}
          >
            {isFirstPrompt && chatHistory.length === 0 ? ( // Ensure history is empty too
              <div className="flex flex-col items-center justify-center h-[400px] space-y-10">
                <h1 className="text-center text-4xl md:text-5xl font-bold">
                  {" "}
                  {/* Responsive text size */}
                  <span className="bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent">
                    {" "}
                    {/* Adjusted gradient */}
                    Hello!
                  </span>
                </h1>
                <h3 className="text-center text-sm md:text-sm font-bold w-[460px] ">
                  {" "}
                  {/* Responsive text size */}
                  <span className="bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent">
                    {" "}
                    {/* Adjusted gradient */}I can help you with questions about
                    your Collective Bargaining Agreement (CBA). To find the most
                    accurate information, could you please tell me your role
                    (like engineer or conductor) and your region or the specific
                    agreement you're referring to?
                  </span>
                </h3>
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
                    <div
                      className={`flex items-start gap-2.5 max-w-[85%] md:max-w-[80%]`}
                    >
                      {" "}
                      {/* Adjusted gap and max-width */}
                      {message.role === "bot" && (
                        <Avatar className="w-8 h-8 shrink-0">
                          {" "}
                          {/* Added shrink-0 */}
                          <AvatarImage
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-avatar-icon-sp2bKzW5OCu4C1f64jSvrbY0bgCc8M.png"
                            alt="Bot Avatar"
                          />
                        </Avatar>
                      )}
                      <div
                        className={`prose prose-sm max-w-none inline-block p-3 px-4 rounded-2xl ${
                          // Added prose classes for markdown styling
                          message.role === "user"
                            ? "bg-blue-500 text-white rounded-tr-none dark:bg-blue-600" // Adjusted user bubble style
                            : "bg-gray-100 text-gray-800 rounded-tl-none dark:bg-gray-700 dark:text-gray-200" // Adjusted bot bubble style
                        }`}
                      >
                        {message.role === "bot" ? (
                          // The loading animation for bot messages needs careful handling
                          isLoading &&
                          message.content === loadingText &&
                          index === chatHistory.length - 1 ? (
                            <span className="italic">{loadingText}</span>
                          ) : (
                            <div className="prose prose-sm max-w-none">
                              <ReactMarkdown
                                remarkPlugins={[
                                  remarkGfm,
                                  remarkBreaks,
                                  remarkParse,
                                ]}
                                skipHtml={false}
                              >
                                {message.content.split("\n\nReferences:")[0]}
                              </ReactMarkdown>
                            </div>
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
          <div className="w-full max-w-[700px] mx-auto sticky bottom-0 bg-white dark:bg-gray-800 py-3 px-4 border-t dark:border-gray-700">
            <ChatInput onSend={handleSend} isLoading={isLoading} />
          </div>
        </main>
        {/* References Panel */}
        <div
          data-references-panel
          className={`fixed right-0 w-80 bg-blue-50 dark:bg-gray-800/80 overflow-y-auto rounded-3xl m-2 mr-10 min-h-[200px] max-h-[calc(100vh-11rem)] transition-transform duration-1700 ease-in-out ${
            Object.keys(references).length > 0
              ? "translate-x-0"
              : "translate-x-full"
          }`}
        >
          <ReferencesPanel references={references} />
        </div>
      </div>
      <Toaster />
    </div>
  );
}

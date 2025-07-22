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

import { ChatInput } from "@/components/chat-input";
import { MessageActions } from "@/components/message-actions";
import { ModelSelector } from "@/components/model-selector";
import { ReferencesPanel } from "@/components/references-panel";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import { sendMessage } from "@/lib/api";
import { ChatMessage, Reference } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";

export default function ChatPage() {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [references, setReferences] = useState<{ [key: string]: Reference }>(
    {}
  );
  const [isFirstPrompt, setIsFirstPrompt] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Thinking...");
  const [isReferencesHidden, setIsReferencesHidden] = useState(false);
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
        setLoadingText((prevText) => {
          if (
            prevText === "Please wait while I look for your document..." ||
            prevText === "Analyzing your CBA to find the answer..."
          ) {
            return prevText === "Please wait while I look for your document..."
              ? "Analyzing your CBA to find the answer..."
              : "Please wait while I look for your document...";
          }
          return "Thinking...";
        });
      }, 3000); // alternation after 3 seconds

      // Show longer messages after 5 seconds (this is when the Agent is executing a tool)
      const timeoutId = setTimeout(() => {
        setLoadingText("Please wait while I look for your document...");
      }, 5000);

      return () => {
        clearInterval(intervalId);
        clearTimeout(timeoutId);
      };
    }
  }, [isLoading]);

  const handleSend = useCallback(
    async (userMessage: string, _botMessage: string) => {
      if (isFirstPrompt) {
        setIsFirstPrompt(false);
      }
      setIsLoading(true);
      setLoadingText("Thinking..."); // Reset to initial state for each new request
      setChatHistory((prev) => [
        ...prev,
        { role: "user", content: userMessage },
        { role: "bot", content: "Thinking..." }, // Use hardcoded initial text
      ]);
      setTimeout(scrollToBottom, 0);

      try {
        const response = await sendMessage(userMessage);
        // Only update references if the new response has references
        if (
          response.references &&
          Object.keys(response.references).length > 0
        ) {
          setReferences(response.references);
        }
        // Otherwise keep the previous references

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
          prev.slice(0, -1).concat({
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
  }, [chatHistory, scrollToBottom]);

  const toggleReferencesVisibility = () => {
    setIsReferencesHidden((prev) => !prev);
  };

  return (
    <div className="flex flex-col flex-1 h-full">
      <div className="flex items-center justify-between">
        <ModelSelector />
        <div className="w-[110px]" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <main
          className={`flex-1 flex flex-col items-center w-full relative overflow-hidden h-[calc(100vh-11rem)] transition-all duration-1700 ease-in-out ${
            Object.keys(references).length > 0 && !isReferencesHidden
              ? "mr-[28rem]"
              : ""
          }`}
        >
          <div
            ref={chatContainerRef}
            className="flex-1 w-full max-w-[800px] mx-auto px-4 pb-4 overflow-y-auto scrollbar-hide"
            style={{
              height: "calc(100vh - 10rem)",
              maxHeight: "calc(100vh - 10rem)",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              "&::-webkit-scrollbar": {
                display: "none",
              },
            }}
          >
            {isFirstPrompt && chatHistory.length === 0 ? (
              <div className="relative -mt-32">
                <div className="flex flex-col items-center justify-center h-[500px] space-y-10">
                  <h1 className="text-center text-4xl md:text-5xl font-bold">
                    <span className="bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent">
                      {typeof window !== "undefined" &&
                      sessionStorage.getItem("user_name")
                        ? `Hello ${sessionStorage.getItem("user_name")}!`
                        : "Hello!"}
                    </span>
                  </h1>
                  <h3 className="text-center text-sm md:text-sm font-bold w-[450px]">
                    <span className="bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent">
                      I can help you with questions about your Collective
                      Bargaining Agreement (CBA). To find the most accurate
                      information, could you please tell me your role
                      (Conductor, Engineer, or Yard Coordinator) and your work
                      territory/location?
                    </span>
                  </h3>
                </div>
                <div className="absolute bottom-8 left-0 right-0 w-full max-w-[850px] mx-auto">
                  <ChatInput onSend={handleSend} isLoading={isLoading} />
                </div>
              </div>
            ) : (
              <div className="w-full">
                {chatHistory.map((message, index) => (
                  <div
                    key={index}
                    className={`flex flex-col ${
                      message.role === "user" ? "items-end" : "items-start"
                    } mb-4`}
                  >
                    <div className="flex items-start gap-2.5 max-w-[85%] md:max-w-[80%]">
                      {message.role === "bot" && (
                        <Avatar
                          className={`w-8 h-8 shrink-0 ${
                            isLoading && index === chatHistory.length - 1
                              ? "animate-bounce"
                              : ""
                          }`}
                        >
                          <AvatarImage
                            src="/gemini-logo-new.png"
                            alt="Bot Avatar"
                          />
                        </Avatar>
                      )}
                      <div
                        className={`prose prose-sm max-w-none inline-block p-3 px-4 rounded-3xl text-justify ${
                          message.role === "user"
                            ? "bg-blue-100 text-gray-800 rounded-tr-none dark:bg-secondary-dark dark:text-gray-200"
                            : "bg-chatInput-light text-gray-800 rounded-tl-none dark:bg-background dark:text-gray-200"
                        }`}
                      >
                        {message.role === "bot" ? (
                          isLoading &&
                          index === chatHistory.length - 1 &&
                          message.role === "bot" ? (
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
                                components={{
                                  p: ({ children }) => (
                                    <p className="mb-4 last:mb-0">{children}</p>
                                  ),
                                }}
                              >
                                {message.content
                                  .split("\n\nReferences:")[0]
                                  .replace(/\n\n/g, "\n\n")
                                  .trim()}
                              </ReactMarkdown>
                            </div>
                          )
                        ) : (
                          message.content
                        )}
                      </div>
                    </div>
                    {message.role === "bot" &&
                      index === chatHistory.length - 1 &&
                      !isLoading &&
                      !(isLoading && message.content === loadingText) && (
                        <div className="ml-10 mt-2">
                          <MessageActions message={message.content} />
                        </div>
                      )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Gradient Overlay */}
          {(!isFirstPrompt || chatHistory.length > 0) && (
            <div className="pointer-events-none absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-chatInput-light to-transparent dark:hidden z-10" />
          )}

          {/* Bottom Gradient Overlay */}
          {(!isFirstPrompt || chatHistory.length > 0) && (
            <div className="pointer-events-none absolute bottom-32 left-0 right-0 h-32 bg-gradient-to-t from-chatInput-light to-transparent dark:hidden z-10" />
          )}

          {/* Move the ChatInput outside the conditional render and add transition */}
          <div
            className={`w-full max-w-[850px] mx-auto sticky transition-all duration-700 ease-in-out ${
              isFirstPrompt && chatHistory.length === 0
                ? "opacity-0"
                : "opacity-100 bottom-0 bg-chatInput-light dark:bg-background py-2 px-4 dark:border-gray-700"
            }`}
          >
            {!isFirstPrompt && (
              <ChatInput onSend={handleSend} isLoading={isLoading} />
            )}
          </div>
        </main>

        {Object.keys(references).length > 0 && (
          <>
            {/* Show references button when panel is hidden */}
            {isReferencesHidden && (
              <button
                onClick={toggleReferencesVisibility}
                className="fixed right-4 top-40 z-20 p-3 bg-blue-100 dark:bg-gray-700 rounded-full hover:bg-blue-200 dark:hover:bg-gray-600 transition-all duration-300 shadow-lg"
                aria-label="Show references"
              >
                <svg
                  className="w-5 h-5 text-gray-600 dark:text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}

            {/* References panel */}
            <div
              data-references-panel
              className={`fixed right-0 w-[28rem] bg-blue-50 dark:bg-secondary-dark overflow-y-auto rounded-3xl m-2 mr-10 mt-16 min-h-[200px] max-h-[calc(100vh-14rem)] transition-transform duration-700 ease-in-out shadow-[0_3px_3px_-1px_rgba(5,0.7,.7,0.4)] ${
                isReferencesHidden ? "translate-x-[120%]" : "translate-x-0"
              }`}
            >
              <ReferencesPanel
                references={references}
                isHidden={isReferencesHidden}
                onToggleVisibility={toggleReferencesVisibility}
              />
            </div>
          </>
        )}
      </div>
      <Toaster />
    </div>
  );
}

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
import packageJson from "../../package.json";

// Get version from package.json
const packageVersion = packageJson.version;

export default function ChatPage() {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [references, setReferences] = useState<{ [key: string]: Reference }>(
    {}
  );
  const [isFirstPrompt, setIsFirstPrompt] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Thinking...");
  const [isReferencesHidden, setIsReferencesHidden] = useState(false);
  const [selectedModel, setSelectedModel] =
    useState<string>("gemini-2.5-flash");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Persist and restore chat state
  useEffect(() => {
    // Restore chat history and references when component mounts
    const storedChatHistory = localStorage.getItem("chatHistory");
    const storedReferences = localStorage.getItem("chatReferences");
    const storedIsFirstPrompt = localStorage.getItem("isFirstPrompt");

    if (storedChatHistory) {
      try {
        const parsedHistory = JSON.parse(storedChatHistory);
        setChatHistory(parsedHistory);

        // Check if the last message is a hanging "Thinking..." message
        if (parsedHistory.length > 0) {
          const lastMessage = parsedHistory[parsedHistory.length - 1];
          if (
            lastMessage.role === "bot" &&
            lastMessage.content === "Thinking..."
          ) {
            // Remove the hanging "Thinking..." message
            const cleanedHistory = parsedHistory.slice(0, -1);
            setChatHistory(cleanedHistory);
            localStorage.setItem("chatHistory", JSON.stringify(cleanedHistory));
          }
          setIsFirstPrompt(false);
        }
      } catch (error) {
        console.error("Error parsing stored chat history:", error);
      }
    }

    if (storedReferences) {
      try {
        const parsedReferences = JSON.parse(storedReferences);
        setReferences(parsedReferences);
      } catch (error) {
        console.error("Error parsing stored references:", error);
      }
    }

    if (storedIsFirstPrompt !== null) {
      try {
        const parsedIsFirstPrompt = JSON.parse(storedIsFirstPrompt);
        setIsFirstPrompt(parsedIsFirstPrompt);
      } catch (error) {
        console.error("Error parsing stored isFirstPrompt:", error);
      }
    }

    // Listen for storage events to sync state when localStorage is cleared from another tab/context
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "chatHistory" && !e.newValue) {
        setChatHistory([]);
      }
      if (e.key === "chatReferences" && !e.newValue) {
        setReferences({});
      }
      if (e.key === "isFirstPrompt" && !e.newValue) {
        setIsFirstPrompt(true);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Cleanup function to abort any ongoing requests when component unmounts
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    } else {
      localStorage.removeItem("chatHistory");
    }
  }, [chatHistory]);

  // Save references to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(references).length > 0) {
      localStorage.setItem("chatReferences", JSON.stringify(references));
    } else {
      localStorage.removeItem("chatReferences");
    }
  }, [references]);

  // Save isFirstPrompt to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("isFirstPrompt", JSON.stringify(isFirstPrompt));
  }, [isFirstPrompt]);

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      const scrollHeight = chatContainerRef.current.scrollHeight;
      const height = chatContainerRef.current.clientHeight;
      const maxScrollTop = scrollHeight - height;
      chatContainerRef.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }
  }, []);

  // Function to handle citation clicks
  const handleCitationClick = useCallback(
    (citationNumber: string) => {
      const reference = references[citationNumber];
      if (reference && reference.link) {
        window.open(reference.link, "_blank");
      }
    },
    [references]
  );

  // Component to render message content with clickable citations
  const MessageContent = ({ content }: { content: string }) => {
    const cleanContent = content
      .split("\n\nReferences:")[0]
      .replace(/\n\n/g, "\n\n")
      .trim();
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (containerRef.current) {
        // Clear any existing citation buttons to prevent duplicates
        const existingButtons = containerRef.current.querySelectorAll(
          "button[data-citation]"
        );
        existingButtons.forEach((button) => {
          const parent = button.parentNode;
          if (parent) {
            parent.replaceChild(
              document.createTextNode(
                `[${button.getAttribute("data-citation")}]`
              ),
              button
            );
          }
        });

        // Find all text nodes that contain citations and replace them with buttons
        const walker = document.createTreeWalker(
          containerRef.current,
          NodeFilter.SHOW_TEXT,
          null
        );

        const textNodes: Text[] = [];
        let node;
        while ((node = walker.nextNode())) {
          const textContent = node.textContent || "";
          if (/\[\d+(?:\s*,\s*\d+)*\]/.test(textContent)) {
            textNodes.push(node as Text);
          }
        }

        textNodes.forEach((textNode) => {
          const parent = textNode.parentNode;
          if (!parent) return;

          const text = textNode.textContent || "";
          // Enhanced regex to match both [number] and [number, number, ...] patterns
          const citationRegex = /\[(\d+(?:\s*,\s*\d+)*)\]/g;

          const matches = [...text.matchAll(citationRegex)];

          if (matches.length > 0) {
            const fragment = document.createDocumentFragment();
            let lastIndex = 0;

            matches.forEach((match) => {
              const citationNumbers = match[1].split(",").map((n) => n.trim());
              const matchStart = match.index!;
              const matchEnd = matchStart + match[0].length;

              // Add text before the citation
              if (matchStart > lastIndex) {
                const beforeText = text.substring(lastIndex, matchStart);
                fragment.appendChild(document.createTextNode(beforeText));
              }

              // Create a container for multiple citations
              if (citationNumbers.length === 1) {
                // Single citation - keep existing behavior
                const citationNumber = citationNumbers[0];
                const reference = references[citationNumber];
                if (reference) {
                  const button = document.createElement("button");
                  button.textContent = `[${citationNumber}]`;
                  button.setAttribute("data-citation", citationNumber);
                  button.className =
                    "relative text-blue-600/80 hover:text-blue-800 hover:underline bg-blue-50 hover:bg-blue-100 rounded-full px-1.5 py-1 text-sm font-medium transition-colors duration-200 mx-0.5 dark:text-blue-400/60 dark:hover:text-blue-300 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 group";

                  // Create tooltip element
                  const tooltip = document.createElement("div");
                  tooltip.className =
                    "absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-5 py-5 bg-gray-100 text-gray-800 text-xs rounded-full shadow-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none  dark:bg-secondary-dark dark:text-gray-200 dark:border-gray-600";
                  tooltip.innerHTML = `<div class="font-semibold text-gray-600 dark:text-gray-200">${reference.title}</div>`;

                  // Add arrow to tooltip
                  const arrow = document.createElement("div");
                  arrow.className =
                    "absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-100 dark:border-b-secondary-dark";
                  tooltip.appendChild(arrow);

                  button.appendChild(tooltip);
                  button.addEventListener("click", () =>
                    handleCitationClick(citationNumber)
                  );
                  fragment.appendChild(button);
                } else {
                  fragment.appendChild(
                    document.createTextNode(`[${citationNumber}]`)
                  );
                }
              } else {
                // Multiple citations - create a wrapper with individual buttons
                const wrapper = document.createElement("span");
                wrapper.textContent = "[";
                fragment.appendChild(wrapper);

                citationNumbers.forEach((citationNumber, index) => {
                  const reference = references[citationNumber];
                  if (reference) {
                    const button = document.createElement("button");
                    button.textContent = citationNumber;
                    button.setAttribute("data-citation", citationNumber);
                    button.className =
                      "relative text-blue-600/80 hover:text-blue-800 hover:underline bg-blue-50 hover:bg-blue-100 rounded-full px-1.5 py-0.5 text-sm font-medium transition-colors duration-200 mx-0.5 dark:text-blue-400/60 dark:hover:text-blue-300 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 group";

                    // Create tooltip element
                    const tooltip = document.createElement("div");
                    tooltip.className =
                      "absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-5 py-5 bg-gray-100 text-gray-800 text-xs rounded-full shadow-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none  dark:bg-secondary-dark dark:text-gray-200 dark:border-gray-600";
                    tooltip.innerHTML = `<div class="font-semibold text-gray-600 dark:text-gray-200">${reference.title}</div>`;

                    // Add arrow to tooltip
                    const arrow = document.createElement("div");
                    arrow.className =
                      "absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-100 dark:border-b-secondary-dark";
                    tooltip.appendChild(arrow);

                    button.appendChild(tooltip);
                    button.addEventListener("click", () =>
                      handleCitationClick(citationNumber)
                    );
                    wrapper.appendChild(button);
                  } else {
                    const textNode = document.createTextNode(citationNumber);
                    wrapper.appendChild(textNode);
                  }

                  // Add comma separator except for the last item
                  if (index < citationNumbers.length - 1) {
                    wrapper.appendChild(document.createTextNode(", "));
                  }
                });

                const closingBracket = document.createTextNode("]");
                wrapper.appendChild(closingBracket);
                fragment.appendChild(wrapper);
              }

              lastIndex = matchEnd;
            });

            // Add remaining text after the last citation
            if (lastIndex < text.length) {
              const remainingText = text.substring(lastIndex);
              fragment.appendChild(document.createTextNode(remainingText));
            }

            parent.replaceChild(fragment, textNode);
          }
        });
      }
    }, [cleanContent, references, handleCitationClick]);

    return (
      <div ref={containerRef} className="prose prose-sm max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks, remarkParse]}
          skipHtml={false}
          components={{
            p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
          }}
        >
          {cleanContent}
        </ReactMarkdown>
      </div>
    );
  };

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
      // Prevent sending if already loading
      if (isLoading) {
        return;
      }

      if (isFirstPrompt) {
        setIsFirstPrompt(false);
      }

      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      setLoadingText("Thinking..."); // Reset to initial state for each new request
      setChatHistory((prev) => [
        ...prev,
        { role: "user", content: userMessage },
        { role: "bot", content: "Thinking..." }, // Use hardcoded initial text
      ]);
      setTimeout(scrollToBottom, 0);

      try {
        const response = await sendMessage(userMessage, {
          signal: abortControllerRef.current.signal,
          model: selectedModel,
        });

        // Check if request was aborted
        if (abortControllerRef.current.signal.aborted) {
          return;
        }

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
      } catch (error: any) {
        // Don't show error if request was aborted (user navigated away)
        if (
          error.name === "AbortError" ||
          abortControllerRef.current?.signal.aborted
        ) {
          return;
        }

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
        // Only update loading state if request wasn't aborted
        if (!abortControllerRef.current?.signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    [scrollToBottom, isFirstPrompt, loadingText, isLoading, selectedModel]
  );

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, scrollToBottom]);

  // Listen for new session events from the sidebar
  useEffect(() => {
    const handleNewSession = () => {
      // Cancel any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Add a brief fade effect before resetting
      if (chatContainerRef.current) {
        chatContainerRef.current.style.opacity = "0";
        chatContainerRef.current.style.transform = "translateY(10px)";
      }

      // Reset all state to initial values after a short delay for smooth transition
      setTimeout(() => {
        setChatHistory([]);
        setReferences({});
        setIsFirstPrompt(true);
        setIsLoading(false);
        setLoadingText("Thinking...");
        setIsReferencesHidden(false);

        // Clear persisted data from localStorage
        localStorage.removeItem("chatHistory");
        localStorage.removeItem("chatReferences");
        localStorage.removeItem("isFirstPrompt");

        // Scroll to top and restore visibility
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = 0;
          chatContainerRef.current.style.opacity = "1";
          chatContainerRef.current.style.transform = "translateY(0)";
        }

        toast({
          title: "New Session Started",
          description:
            "Ready to start a fresh conversation. Ask me anything about your CBA!",
          duration: 3000,
        });
      }, 150); // Short delay for smooth transition
    };

    window.addEventListener("newSessionStarted", handleNewSession);

    return () => {
      window.removeEventListener("newSessionStarted", handleNewSession);
    };
  }, []);

  const toggleReferencesVisibility = () => {
    setIsReferencesHidden((prev) => !prev);
  };

  return (
    <div className="flex flex-col flex-1 h-full">
      <div className="flex items-center justify-between">
        <ModelSelector
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
        />
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
            className="flex-1 w-full max-w-[800px] mx-auto px-4 pb-4 overflow-y-auto scrollbar-hide transition-all duration-700 ease-in-out"
            style={{
              height: "calc(100vh - 10rem)",
              maxHeight: "calc(100vh - 10rem)",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {isFirstPrompt && chatHistory.length === 0 ? (
              <div className="relative -mt-32 animate-in fade-in duration-700 ease-in-out">
                <div className="flex flex-col items-center justify-center h-[500px] space-y-10 transform transition-all duration-700 ease-in-out">
                  <h1 className="text-center text-4xl md:text-5xl font-bold animate-in slide-in-from-top-8 duration-1000 ease-out">
                    <span className="bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent">
                      {typeof window !== "undefined" &&
                      sessionStorage.getItem("user_name")
                        ? `Hello ${sessionStorage.getItem("user_name")}!`
                        : "Hello!"}
                    </span>
                  </h1>
                  <h3 className="text-center text-sm md:text-sm font-bold w-[450px] animate-in slide-in-from-top-12 duration-1200 ease-out delay-200">
                    <span className="bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent">
                      I can help you with questions about your Collective
                      Bargaining Agreement (CBA). To find the most accurate
                      information, could you please tell me your role
                      (Conductor, Engineer, or Yard Coordinator) and your work
                      territory/location?
                    </span>
                  </h3>
                </div>
                <div className="absolute bottom-8 left-0 right-0 w-full max-w-[850px] mx-auto animate-in slide-in-from-bottom-8 duration-1000 ease-out delay-400">
                  <ChatInput onSend={handleSend} isLoading={isLoading} />
                </div>
              </div>
            ) : (
              <div className="w-full animate-in fade-in duration-500 ease-in-out">
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
                          className={`w-6 h-6 shrink-0 ${
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
                            <MessageContent content={message.content} />
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
            {(!isFirstPrompt || chatHistory.length > 0) && (
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

      {/* Version display - bottom left corner */}
      <div className="fixed bottom-4 left-4 z-10">
        <span className="text-xs text-muted-foreground/60 bg-background/80 dark:bg-background/80 px-1 py-1 rounded-lg font-mono backdrop-blur-sm border border-border/20">
          v{packageVersion}
        </span>
      </div>

      <Toaster />
    </div>
  );
}

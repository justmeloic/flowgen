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

import { ChatInput } from "@/components/Agent/ChatInput";
import { MermaidDiagram } from "@/components/Agent/MermaidDiagram";
import { MessageActions } from "@/components/Agent/MessageActions";
import { PlatformSelector } from "@/components/Agent/PlatformSelector";
import { BugReportDialog } from "@/components/BugReport/BugReportDialog";
import { DiagramPanel } from "@/components/DiagramPanel";
import { MermaidPanel } from "@/components/MermaidEditor";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import { sendMessage, startNewSession } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ChatMessage, Diagram } from "@/types";
import { Bug, Maximize2, SquarePen } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import packageJson from "../../package.json";

// Typewriter hook
const useTypewriter = (text: string, speed: number = 100) => {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (text.length === 0) return;

    setDisplayText("");
    setIsComplete(false);
    let index = 0;

    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayText, isComplete };
};

// Get version from package.json
const packageVersion = packageJson.version;

export default function ChatPage() {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [diagram, setDiagram] = useState<Diagram | null>(null);
  const [isFirstPrompt, setIsFirstPrompt] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Thinking...");
  const [isDiagramHidden, setIsDiagramHidden] = useState(true);
  const [isMermaidEditorOpen, setIsMermaidEditorOpen] = useState(false);
  const [selectedModel, setSelectedModel] =
    useState<string>("gemini-2.5-flash");
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [isStartingNew, setIsStartingNew] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(true);
  const [isBugReportOpen, setIsBugReportOpen] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Manage body scroll when overlays are open
  useEffect(() => {
    if (!isDiagramHidden || isMermaidEditorOpen) {
      // Prevent body scroll when diagram panel is open or editor is open
      document.body.style.overflow = "hidden";
    } else {
      // Restore body scroll when all overlays are closed
      document.body.style.overflow = "unset";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isDiagramHidden, isMermaidEditorOpen]);

  // Typewriter animation for greeting
  const greetingText =
    typeof window !== "undefined" && sessionStorage.getItem("user_name")
      ? `Hello ${sessionStorage.getItem("user_name")}!`
      : "Hello!";

  const subtitleText =
    "I can help you design comprehensive system architectures";

  const { displayText: displayGreeting, isComplete: greetingComplete } =
    useTypewriter(greetingText, 80);
  const { displayText: displaySubtitle, isComplete: subtitleComplete } =
    useTypewriter(greetingComplete ? subtitleText : "", 30);

  // Persist and restore chat state
  useEffect(() => {
    // Restore chat history and diagram when component mounts
    const storedChatHistory = localStorage.getItem("chatHistory");
    const storedDiagram = localStorage.getItem("chatDiagram");
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

    if (storedDiagram) {
      try {
        const parsedDiagram = JSON.parse(storedDiagram);
        setDiagram(parsedDiagram);
      } catch (error) {
        console.error("Error parsing stored diagram:", error);
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
      if (e.key === "chatDiagram" && !e.newValue) {
        setDiagram(null);
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

  // Save diagram to localStorage whenever it changes
  useEffect(() => {
    if (diagram) {
      localStorage.setItem("chatDiagram", JSON.stringify(diagram));
    } else {
      localStorage.removeItem("chatDiagram");
    }
  }, [diagram]);

  // Save isFirstPrompt to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("isFirstPrompt", JSON.stringify(isFirstPrompt));
  }, [isFirstPrompt]);

  // Listen for sidebar toggle events from layout
  useEffect(() => {
    const onSidebarToggled = (e: Event) => {
      const ev = e as CustomEvent<{ isCollapsed: boolean }>;
      if (typeof ev.detail?.isCollapsed === "boolean") {
        setIsSidebarCollapsed(ev.detail.isCollapsed);
      }
    };
    window.addEventListener(
      "sidebarToggled",
      onSidebarToggled as EventListener
    );
    return () => {
      window.removeEventListener(
        "sidebarToggled",
        onSidebarToggled as EventListener
      );
    };
  }, []);

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      const scrollHeight = chatContainerRef.current.scrollHeight;
      const height = chatContainerRef.current.clientHeight;
      const maxScrollTop = scrollHeight - height;
      chatContainerRef.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }
  }, []);

  // Function to handle citation clicks - simplified for diagram mode
  const handleCitationClick = useCallback((citationNumber: string) => {
    // In diagram mode, citations might not have clickable links
    console.log(`Citation ${citationNumber} clicked`);
  }, []);

  // Component to render message content with Mermaid diagrams
  const MessageContent = ({ content }: { content: string }) => {
    const cleanContent = content
      .split("\n\nReferences:")[0]
      .replace(/\n\n/g, "\n\n")
      .trim();
    const containerRef = useRef<HTMLDivElement>(null);

    // Extract Mermaid diagrams from content
    const mermaidPattern = /```mermaid\n([\s\S]*?)\n```/g;
    const mermaidMatches = [...cleanContent.matchAll(mermaidPattern)];
    const contentWithoutMermaid = cleanContent
      .replace(mermaidPattern, "")
      .trim();

    return (
      <div ref={containerRef} className="prose prose-xs max-w-none">
        {/* Render text content */}
        {contentWithoutMermaid && (
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks, remarkParse]}
            skipHtml={false}
            components={{
              p: ({ children }) => (
                <p className="mb-3 last:mb-0 text-sm">{children}</p>
              ),
            }}
          >
            {contentWithoutMermaid}
          </ReactMarkdown>
        )}

        {/* Render Mermaid diagrams */}
        {mermaidMatches.map((match, index) => (
          <div
            key={index}
            className="my-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
              Architecture Diagram
            </h4>
            <MermaidDiagram chart={match[1]} className="w-full" />
          </div>
        ))}
      </div>
    );
  };

  useEffect(() => {
    if (isLoading) {
      const intervalId = setInterval(() => {
        setLoadingText((prevText) => {
          if (
            prevText === "Processing requirements and constraints..." ||
            prevText === "Analyzing your request to find the best answer..."
          ) {
            return prevText === "Processing requirements and constraints..."
              ? "Analyzing your request to find the best answer..."
              : "Processing requirements and constraints...";
          }
          return "Thinking...";
        });
      }, 3000); // alternation after 3 seconds

      // Show longer messages after 5 seconds (this is when the Agent is executing a tool)
      const timeoutId = setTimeout(() => {
        setLoadingText("Processing requirements and constraints...");
      }, 5000);

      return () => {
        clearInterval(intervalId);
        clearTimeout(timeoutId);
      };
    }
  }, [isLoading]);

  const handleSend = useCallback(
    async (userMessage: string, files?: File[]) => {
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
        const response = await sendMessage(userMessage, files, {
          signal: abortControllerRef.current.signal,
          model: selectedModel,
          platform: (selectedPlatform ?? undefined) as
            | "aws"
            | "gcp"
            | undefined,
        });

        // Check if request was aborted
        if (abortControllerRef.current.signal.aborted) {
          return;
        }

        // Only update diagram if the new response has a diagram
        if (response.diagram && response.diagram.diagram_code) {
          setDiagram(response.diagram);
        }
        // Otherwise keep the previous diagram

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
    [
      scrollToBottom,
      isFirstPrompt,
      loadingText,
      isLoading,
      selectedModel,
      selectedPlatform,
    ]
  );

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, scrollToBottom]);

  // Handler for new conversation button
  const handleNewConversation = () => {
    setIsStartingNew(true);
    try {
      // Clear the session ID to start a new session
      startNewSession();

      // Dispatch a custom event to notify other components (like the chat page)
      window.dispatchEvent(new CustomEvent("newSessionStarted"));

      console.log("New session started from button");
      // Show success feedback for a moment
      setTimeout(() => setIsStartingNew(false), 1500);
    } catch (error) {
      console.error("Error starting new session:", error);
      setIsStartingNew(false);
    }
  };

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
        setDiagram(null);
        setIsFirstPrompt(true);
        setIsLoading(false);
        setLoadingText("Thinking...");
        setIsDiagramHidden(false);

        // Clear persisted data from localStorage
        localStorage.removeItem("chatHistory");
        localStorage.removeItem("chatDiagram");
        localStorage.removeItem("isFirstPrompt");

        // Scroll to top and restore visibility
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = 0;
          chatContainerRef.current.style.opacity = "1";
          chatContainerRef.current.style.transform = "translateY(0)";
        }

        toast({
          title: "New Session Started",
          description: "Ready to start a fresh conversation. Ask me anything!",
          duration: 3000,
        });
      }, 150); // Short delay for smooth transition
    };

    window.addEventListener("newSessionStarted", handleNewSession);

    return () => {
      window.removeEventListener("newSessionStarted", handleNewSession);
    };
  }, []);

  // Handle Escape key to close diagram panel
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && diagram && !isDiagramHidden) {
        setIsDiagramHidden(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [diagram, isDiagramHidden]);

  const toggleDiagramVisibility = () => {
    setIsDiagramHidden((prev: boolean) => !prev);
  };

  const openDiagramPanel = () => {
    // Ensure the diagram panel is visible (no toggle close)
    if (diagram) {
      setIsDiagramHidden(false);
    }
  };

  const handleEditMermaid = (diagramToEdit: Diagram) => {
    setIsMermaidEditorOpen(true);
    // Keep diagram panel visible, editor will overlay on top
  };

  const handleCloseMermaidEditor = () => {
    setIsMermaidEditorOpen(false);
    // Diagram panel stays expanded when editor closes
  };

  const handleDiagramUpdate = (updatedDiagram: Diagram) => {
    setDiagram(updatedDiagram);
  };

  return (
    <div className="flex flex-col flex-1 h-full">
      <div
        className={`flex items-center justify-center sm:justify-between transition-all duration-1700 ease-in-out ${
          diagram && !isDiagramHidden ? "blur-sm" : ""
        }`}
      >
        <Button
          onClick={handleNewConversation}
          disabled={isStartingNew}
          className={cn(
            "hidden sm:block p-3 bg-blue-100 dark:bg-gray-700 rounded-full hover:bg-blue-200 dark:hover:bg-gray-600 transition-all duration-300 ease-in-out shadow-lg -translate-y-3 md:-translate-y-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background translate-x-24",
            isStartingNew && "opacity-50 cursor-not-allowed",
            !isSidebarCollapsed && "hidden"
          )}
          aria-label="New conversation"
        >
          <SquarePen
            className={cn(
              "w-4 h-4 text-gray-600/80 dark:text-gray-300",
              isStartingNew && "animate-pulse"
            )}
          />
        </Button>
        <div className="flex items-center gap-2 sm:w-[220px]">
          <PlatformSelector
            selectedPlatform={selectedPlatform}
            onPlatformChange={setSelectedPlatform}
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <main
          className={`flex-1 flex flex-col items-center w-full relative overflow-hidden h-[calc(100vh-11rem)] transition-all duration-1700 ease-in-out ${
            diagram && !isDiagramHidden ? "blur-sm" : ""
          }`}
        >
          <div
            ref={chatContainerRef}
            className="flex-1 w-full max-w-[800px] mx-auto px-1 sm:px-4 pb-4 overflow-y-auto scrollbar-hide transition-all duration-700 ease-in-out"
            style={{
              height: "calc(100vh - 10rem)",
              maxHeight: "calc(100vh - 10rem)",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {isFirstPrompt && chatHistory.length === 0 ? (
              <div className="relative -mt-16 sm:-mt-32 animate-in fade-in duration-700 ease-in-out">
                <div className="flex flex-col items-center justify-center h-[400px] sm:h-[500px] space-y-6 sm:space-y-10 transform transition-all duration-700 ease-in-out px-1 sm:px-4">
                  <h1 className="text-center text-2xl sm:text-4xl md:text-5xl font-bold">
                    <span
                      className="bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent font-cursive dark:from-gray-300 dark:to-gray-100"
                      style={{
                        fontWeight: 500,
                        letterSpacing: "0.02em",
                        lineHeight: 1.2,
                      }}
                    >
                      {displayGreeting}
                      <span className="animate-pulse">|</span>
                    </span>
                  </h1>
                  {greetingComplete && (
                    <h3 className="text-center text-sm sm:text-base md:text-lg w-full max-w-[400px] sm:max-w-[600px] transition-opacity duration-500 ease-in-out">
                      <span
                        className="bg-gradient-to-r text-xs sm:text-sm from-gray-600 to-gray-800 bg-clip-text text-transparent font-poppins dark:from-gray-400 dark:to-gray-200"
                        style={{
                          fontWeight: 400,
                          letterSpacing: "0.01em",
                          lineHeight: 1.4,
                        }}
                      >
                        {displaySubtitle}
                        {!subtitleComplete && (
                          <span className="animate-pulse">|</span>
                        )}
                      </span>
                    </h3>
                  )}
                </div>
                {subtitleComplete && (
                  <div className="absolute bottom-8 left-0 right-0 w-full max-w-[850px] mx-auto animate-in slide-in-from-bottom-8 duration-1000 ease-out delay-400">
                    <ChatInput onSend={handleSend} isLoading={isLoading} />
                  </div>
                )}
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
                            src="/logo-light.png"
                            alt="Bot Avatar"
                            className="dark:hidden"
                          />
                          <AvatarImage
                            src="/logo-dark.png"
                            alt="Bot Avatar"
                            className="hidden dark:block"
                          />
                        </Avatar>
                      )}
                      <div
                        className={`prose prose-xs max-w-none inline-block p-3 px-4 rounded-3xl text-justify ${
                          message.role === "user"
                            ? "bg-background text-foreground rounded-tr-none border border-border/20 dark:bg-gray-800 dark:text-foreground dark:border-border/30"
                            : "bg-chatInput-light text-gray-800 rounded-tl-none dark:bg-background dark:text-gray-200"
                        }`}
                        style={
                          message.role === "user"
                            ? {
                                boxShadow:
                                  "0 4px 8px 0 rgba(0, 0, 0, 0.12), 0 2px 4px 0 rgba(0, 0, 0, 0.08)",
                                filter:
                                  "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))",
                              }
                            : {}
                        }
                      >
                        {message.role === "bot" ? (
                          isLoading &&
                          index === chatHistory.length - 1 &&
                          message.role === "bot" ? (
                            <span className="italic text-sm">
                              {loadingText}
                            </span>
                          ) : (
                            <>
                              <MessageContent content={message.content} />
                              {diagram?.diagram_code &&
                                index === chatHistory.length - 1 &&
                                !isLoading && (
                                  <div className="mt-6 flex justify-start">
                                    <button
                                      onClick={openDiagramPanel}
                                      className="flex items-center gap-2 px-3 py-1.5 text-xs bg-blue-100 hover:bg-blue-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-gray-500 animate-bounce motion-reduce:animate-none"
                                      aria-label="Expand diagram"
                                    >
                                      <Maximize2 className="w-3 h-3" />
                                      Expand diagram
                                    </button>
                                  </div>
                                )}
                            </>
                          )
                        ) : (
                          <span className="text-sm">{message.content}</span>
                        )}
                      </div>
                    </div>
                    {message.role === "bot" &&
                      index === chatHistory.length - 1 &&
                      !isLoading &&
                      !(isLoading && message.content === loadingText) && (
                        <div className="ml-10 mt-2">
                          <MessageActions
                            message={message.content}
                            onResend={
                              diagram?.diagram_code
                                ? () => {
                                    // Send "Regenerate the diagram" command to the agent
                                    handleSend("Regenerate the diagram");
                                  }
                                : undefined
                            }
                          />
                        </div>
                      )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Move the ChatInput outside the conditional render and add transition */}
          <div
            className={`w-full max-w-[850px] mx-auto sticky transition-all duration-700 ease-in-out ${
              isFirstPrompt && chatHistory.length === 0
                ? "opacity-0"
                : `opacity-100 bottom-0 bg-chatInput-light dark:bg-background py-2 px-1 sm:px-4 dark:border-gray-700 ${
                    diagram && !isDiagramHidden ? "blur-sm" : ""
                  }`
            }`}
          >
            {(!isFirstPrompt || chatHistory.length > 0) && (
              <ChatInput onSend={handleSend} isLoading={isLoading} />
            )}
          </div>
        </main>

        {diagram && (
          <>
            {/* Backdrop overlay */}
            {!isDiagramHidden && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-700 ease-in-out"
                onClick={toggleDiagramVisibility}
              />
            )}

            {/* Diagram panel - centered and larger */}
            <div
              data-diagram-panel
              className={`fixed mt-10 top-1/2 left-1/2 w-[90vw] max-w-[1200px] h-[85vh] bg-blue-50 dark:bg-secondary-dark overflow-y-auto rounded-3xl shadow-2xl z-40 transition-all duration-700 ease-in-out ${
                isDiagramHidden
                  ? "transform -translate-x-1/2 -translate-y-1/2 scale-95 opacity-0 pointer-events-none"
                  : "transform -translate-x-1/2 -translate-y-1/2 scale-100 opacity-100"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <DiagramPanel
                diagram={diagram}
                isHidden={isDiagramHidden}
                onToggleVisibility={toggleDiagramVisibility}
                onEditMermaid={handleEditMermaid}
              />
            </div>
          </>
        )}

        {/* Mermaid Editor Panel - overlays on top of diagram panel */}
        {isMermaidEditorOpen && diagram && (
          <>
            {/* Additional overlay for editor */}
            <div
              className="fixed inset-0 bg-black bg-opacity-30 z-50"
              onClick={handleCloseMermaidEditor}
            />
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={handleCloseMermaidEditor}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <MermaidPanel
                  diagram={diagram}
                  onDiagramUpdate={handleDiagramUpdate}
                  onClose={handleCloseMermaidEditor}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Floating Bug Report Button - Bottom Right */}
      <Button
        onClick={() => setIsBugReportOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-20 p-3 bg-red-100 dark:bg-red-900/50 rounded-full hover:bg-red-200 dark:hover:bg-red-800/60 transition-all duration-300 ease-in-out shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          diagram && !isDiagramHidden ? "blur-sm" : ""
        )}
        aria-label="Report a bug"
      >
        <Bug className="w-4 h-4 text-red-600 dark:text-red-400" />
      </Button>

      {/* Bug Report Dialog */}

      {/* Bug Report Dialog */}
      <BugReportDialog
        isOpen={isBugReportOpen}
        onClose={() => setIsBugReportOpen(false)}
        currentDiagram={diagram}
        chatHistory={chatHistory}
      />

      <Toaster />
    </div>
  );
}

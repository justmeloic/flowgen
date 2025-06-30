"use client";

import { ChatInput } from "@/components/chat-input";
import { MessageActions } from "@/components/message-actions";
import { ModelSelector } from "@/components/model-selector";
import { ReferencesPanel } from "@/components/references-panel";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import { sendMessage } from "@/lib/api";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";

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
      }, 1000);
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

  return (
    <div className="flex flex-col flex-1 h-full">
      <div className="flex items-center justify-between">
        <ModelSelector />
        <div className="w-[110px]" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <main
          className={`flex-1 flex flex-col items-center w-full relative overflow-hidden h-[calc(100vh-11rem)] transition-all duration-1700 ease-in-out ${
            Object.keys(references).length > 0 ? "mr-80" : ""
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
                      Hello!
                    </span>
                  </h1>
                  <h3 className="text-center text-sm md:text-sm font-bold w-[460px]">
                    <span className="bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent">
                      I can help you with questions about your Collective
                      Bargaining Agreement (CBA). To find the most accurate
                      information, could you please tell me your role (like
                      engineer or conductor) and your region or the specific
                      agreement you're referring to?
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
                        <Avatar className="w-8 h-8 shrink-0">
                          <AvatarImage
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-avatar-icon-sp2bKzW5OCu4C1f64jSvrbY0bgCc8M.png"
                            alt="Bot Avatar"
                          />
                        </Avatar>
                      )}
                      <div
                        className={`prose prose-sm max-w-none inline-block p-3 px-4 rounded-3xl text-justify ${
                          message.role === "user"
                            ? "bg-blue-100 text-gray-800 rounded-tr-none dark:bg-blue-600"
                            : "bg-white text-gray-800 rounded-tl-none dark:bg-gray-700 dark:text-gray-200"
                        }`}
                      >
                        {message.role === "bot" ? (
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
                          message.content
                        )}
                      </div>
                    </div>
                    {message.role === "bot" &&
                      index === chatHistory.length - 1 &&
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
            <div className="pointer-events-none absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white dark:from-gray-800 to-transparent z-10" />
          )}

          {/* Bottom Gradient Overlay */}
          {(!isFirstPrompt || chatHistory.length > 0) && (
            <div className="pointer-events-none absolute bottom-32 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-gray-800 to-transparent z-10" />
          )}

          {/* Move the ChatInput outside the conditional render and add transition */}
          <div
            className={`w-full max-w-[850px] mx-auto sticky transition-all duration-700 ease-in-out ${
              isFirstPrompt && chatHistory.length === 0
                ? "opacity-0"
                : "opacity-100 bottom-0 bg-white dark:bg-gray-800 py-2 px-4 dark:border-gray-700"
            }`}
          >
            {!isFirstPrompt && (
              <ChatInput onSend={handleSend} isLoading={isLoading} />
            )}
          </div>
        </main>

        {Object.keys(references).length > 0 && (
          <div
            data-references-panel
            className={`fixed right-0 w-80 bg-blue-50 dark:bg-gray-800/80 overflow-y-auto rounded-3xl m-2 mr-10 mt-16 min-h-[200px] max-h-[calc(100vh-14rem)] transition-transform duration-1700 ease-in-out ${
              Object.keys(references).length > 0
                ? "translate-x-0"
                : "translate-x-[120%]"
            }`}
          >
            <ReferencesPanel references={references} />
          </div>
        )}
      </div>
      <Toaster />
    </div>
  );
}

"use client";

import * as React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { ChatInput, ChatInputRef } from "@/components/chat-input";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { ModelSelector } from "@/components/model-selector";
import { MessageActions } from "@/components/message-actions";
import Link from "next/link";
import { useToastHandlers } from "@/hooks/toast";
import { sendChatMessage } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

interface ChatMessage {
  role: "user" | "bot";
  content: string;
}

interface MessageActionsProps {
  message: string;
  onCopy: () => Promise<void>;
  onFeedback: (type: "up" | "down") => void;
  onListen: () => void;
  onPause: () => void;
  isPlaying: boolean;
}

export default function ChatPage() {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isFirstPrompt, setIsFirstPrompt] = useState(true);
  const [isResponding, setIsResponding] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioRef, setAudioRef] = useState<SpeechSynthesisUtterance | null>(
    null
  );
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<ChatInputRef>(null); // Add a ref to the ChatInput
  const [loadingText, setLoadingText] = useState("Thinking...");

  const { handleCopyToast, handleAudioToast, handleFeedbackToast } =
    useToastHandlers();

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      const scrollHeight = chatContainerRef.current.scrollHeight;
      const height = chatContainerRef.current.clientHeight;
      const maxScrollTop = scrollHeight - height;
      chatContainerRef.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }
  }, []);

  useEffect(() => {
    if (isResponding) {
      const intervalId = setInterval(() => {
        setLoadingText((prevText) =>
          prevText === "Thinking..." ? "Working..." : "Thinking..."
        );
      }, 1000); // Change every 1 second

      return () => clearInterval(intervalId); // Cleanup on unmount or when isSearching changes
    } else {
      setLoadingText("Thinking...");
    }
  }, [isResponding]);

  const handleListen = useCallback(
    (message: string) => {
      const synth = window.speechSynthesis;

      if (isPlaying) {
        synth.resume();
        handleAudioToast.onResume();
        return;
      }
      if (audioRef && synth.paused) {
        synth.resume();
        setIsPlaying(true);
        handleAudioToast.onResume();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(message);
      setAudioRef(utterance);
      utterance.onend = () => {
        setIsPlaying(false);
      };
      utterance.onpause = () => {
        setIsPlaying(false);
      };
      synth.speak(utterance);
      setIsPlaying(true);
      handleAudioToast.onPlay();
    },
    [isPlaying, audioRef, handleAudioToast]
  );

  const handlePause = useCallback(() => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      handleAudioToast.onPause();
      setIsPlaying(false);
    }
  }, [handleAudioToast]);

  const handleSend = useCallback(
    async (userMessage: string) => {
      setIsResponding(true);

      // clear the input when is responding
      if (chatInputRef.current) {
        chatInputRef.current.clearInput();
      }
      try {
        setChatHistory((prev) => [
          ...prev,
          { role: "user", content: userMessage },
        ]);

        const botResponse = await sendChatMessage(userMessage);

        setChatHistory((prev) => [
          ...prev,
          { role: "bot", content: botResponse },
        ]);

        setIsFirstPrompt(false);
        setTimeout(scrollToBottom, 100);
      } catch (error) {
        console.error("Chat error:", error);
      } finally {
        setIsResponding(false);
      }
    },
    [scrollToBottom]
  );

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  return (
    <div className="flex flex-col flex-1 h-full ">
      <div className="flex items-center justify-between p-4 ">
        <ModelSelector />
        <Link href="/" className="flex h-8 w-8 items-center justify-center">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            stroke="black"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 text-gray-900"
          >
            <path d="M3 10L12 3L21 10V20H14V14H10V20H3V10Z" />
          </svg>
        </Link>
        <div className="w-[180px]" />
      </div>
      <main className="flex-1 flex flex-col items-center w-full relative">
        <div
          ref={chatContainerRef}
          className="flex-1 w-full max-w-[700px] mb-8 mx-auto px-4 pb-4 overflow-y-auto"
          style={{
            height: "calc(100vh - 200px)",
            maxHeight: "calc(100vh - 280px)",
          }}
        >
          {isFirstPrompt ? (
            <div className="flex items-center justify-center h-full">
              <h1 className="text-center text-5xl font-bold">
                <span className="bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">
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
                  <div className={`flex items-center gap-2 max-w-[80%]`}>
                    {message.role === "bot" && (
                      <Avatar className="w-7 h-7">
                        <AvatarImage
                          src="/gemini-logo.png"
                          alt="Bot Avatar"
                          fallback="AI"
                        />
                      </Avatar>
                    )}
                    <div
                      className={`inline-block p-4 rounded-3xl ${
                        message.role === "user"
                          ? "bg-blue-100 text-blue-800 rounded-tr-none"
                          : "bg-white text-gray-800"
                      }`}
                    >
                      {/* Conditional Markdown rendering */}
                      {message.role === "bot" ? (
                        <ReactMarkdown
                          rehypePlugins={[rehypeRaw]}
                          components={{
                            code({
                              node,
                              inline,
                              className,
                              children,
                              ...props
                            }) {
                              const match = /language-(\w+)/.exec(
                                className || ""
                              );
                              return !inline && match ? (
                                <SyntaxHighlighter
                                  children={String(children).replace(/\n$/, "")}
                                  style={oneDark}
                                  language={match[1]}
                                  PreTag="div"
                                  {...props}
                                />
                              ) : (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            },
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        message.content
                      )}
                    </div>
                  </div>
                  {message.role === "bot" &&
                    index === chatHistory.length - 1 && (
                      <div className="ml-10 mt-2">
                        <MessageActions
                          message={message.content}
                          onCopy={() => handleCopyToast(message.content)}
                          onFeedback={handleFeedbackToast}
                          onListen={() => handleListen(message.content)}
                          onPause={handlePause}
                          isPlaying={isPlaying}
                        />
                      </div>
                    )}
                </div>
              ))}
              {isResponding && (
                <p className="text-blue-500/70">{loadingText}</p>
              )}
            </div>
          )}
        </div>
        <div className="w-full max-w-[880px] mx-auto mb-8 px-4 py-4 absolute bottom-8">
          <ChatInput ref={chatInputRef} onSend={handleSend} />{" "}
          {/* Use the ref here */}
        </div>
      </main>
    </div>
  );
}

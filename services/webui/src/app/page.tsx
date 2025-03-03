"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Copy,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Volume2,
  PauseCircle,
  RotateCcw,
  Download,
} from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { useToastHandlers } from "@/hooks/toast";
import { EngineSelector, Engine } from "@/components/engine-selector";
import { UserNav } from "@/components/user-nav";
import { sendMermaidQuery, MermaidResponse } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import Mermaid from "@/components/mermaid";
import { cn } from "@/lib/utils";
import { saveAs } from "file-saver";
import { useUser } from "@/context/UserContext";
import { useEngine } from "@/context/EngineContext";

interface MessageBubbleProps {
  message: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { handleCopyToast } = useToastHandlers();

  const handleCopyCode = async (code: string) => {
    await handleCopyToast(code);
  };

  return (
    <ReactMarkdown
      rehypePlugins={[rehypeRaw]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          const codeString = String(children).replace(/\n$/, "");

          if (!inline && match) {
            return (
              <div className="relative rounded-[2rem] bg-[#282c34] p-4 group">
                <div
                  className={cn(
                    "absolute top-2 right-2 transition-opacity duration-200 rounded-full"
                  )}
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopyCode(codeString)}
                          className="rounded-full"
                        >
                          <Copy className="h-5 w-5 text-gray-600 " />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy Code</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <SyntaxHighlighter
                  children={codeString}
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                />
              </div>
            );
          }

          return (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {message}
    </ReactMarkdown>
  );
};

interface FeedbackActionsProps {
  onCopy: () => void;
  onFeedback: (type: "up" | "down") => void;
  isPlaying: boolean;
  onListen: () => void;
  onPause: () => void;
  onRegenerate: () => void;
  onDownload: () => void;
}

const FeedbackActions: React.FC<FeedbackActionsProps> = ({
  onCopy,
  onFeedback,
  isPlaying,
  onListen,
  onPause,
  onRegenerate,
  onDownload,
}) => {
  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onCopy}>
              <Copy className="h-5 w-5 text-gray-600" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Copy Mermaid Code</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onFeedback("up")}
            >
              <ThumbsUp className="h-5 w-5 text-gray-600" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Thumbs Up</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onFeedback("down")}
            >
              <ThumbsDown className="h-5 w-5 text-gray-600" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Thumbs Down</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={isPlaying ? onPause : onListen}
            >
              {isPlaying ? (
                <PauseCircle className="h-5 w-5 text-gray-600" />
              ) : (
                <Volume2 className="h-5 w-5 text-gray-600" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isPlaying ? "Pause Audio" : "Listen to Mermaid Code"}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onRegenerate}>
              <RotateCcw className="h-5 w-5 text-gray-600" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Regenerate</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onDownload}>
              <Download className="h-5 w-5 text-gray-600" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Download</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5 text-gray-600" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onCopy}>
            <Copy className="mr-2 h-4 w-4" />
            <span>Copy</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { user, loading } = useUser();
  const [mermaidCode, setMermaidCode] = useState("");
  const [isFirstPrompt, setIsFirstPrompt] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioRef, setAudioRef] = useState<SpeechSynthesisUtterance | null>(
    null
  );
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { handleCopyToast, handleAudioToast, handleFeedbackToast } =
    useToastHandlers();
  const [loadingText, setLoadingText] = useState("Search...");
  const { selectedEngine } = useEngine();

  useEffect(() => {
    if (isSearching) {
      const intervalId = setInterval(() => {
        setLoadingText((prevText) =>
          prevText === "Generating..." ? "Thinking..." : "Generating..."
        );
      }, 1000);

      return () => clearInterval(intervalId);
    } else {
      setLoadingText("Generating...");
    }
  }, [isSearching]);

  const handleSearch = async (query: string, files?: File[]) => {
    setSearchQuery(query);
    setIsSearching(true);
    setMermaidCode("");
    setIsFirstPrompt(false);

    try {
      const mermaidResponse: MermaidResponse = await sendMermaidQuery(
        query,
        selectedEngine,
        undefined,
        files
      );
      setMermaidCode(mermaidResponse.response || "No mermaid code available.");
    } catch (error) {
      console.error("Search error:", error);
      setMermaidCode("Error occurred while fetching generated mermaid code.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleCopy = async () => {
    await handleCopyToast(mermaidCode);
  };
  const handleRegenerate = async () => {
    await handleSearch(searchQuery);
  };
  const handleDownload = () => {
    const blob = new Blob([mermaidCode], { type: "text/markdown" });
    saveAs(blob, "mermaid.md");
  };

  const handleListen = () => {
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

    const utterance = new SpeechSynthesisUtterance(mermaidCode);
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
  };

  const handlePause = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      handleAudioToast.onPause();
      setIsPlaying(false);
    }
  };

  const handleFeedback = (type: "up" | "down") => {
    console.log(`Feedback: ${type}`);
    handleFeedbackToast(type);
  };

  const isMermaidCode = (text: string) => {
    return text.trimStart().startsWith("```mermaid");
  };

  const extractMermaidCode = (text: string): string | null => {
    if (!isMermaidCode(text)) {
      return null;
    }
    const start = text.indexOf("```mermaid") + "```mermaid".length;
    const end = text.indexOf("```", start);
    if (start === -1 || end === -1) {
      return null;
    }
    return text.substring(start, end).trim();
  };

  const handleEngineChange = (engine: Engine) => {
    setSelectedEngine(engine);
  };

  return (
    <main className="flex-1 mt-0 max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between p-4">
        <EngineSelector
          onEngineChange={handleEngineChange}
          selectedEngine={selectedEngine}
        />
        <UserNav />
      </div>
      <div className="bg-white px-8 py-6">
        <SearchBar
          onSearch={handleSearch}
          inputRef={searchInputRef}
          externalQuery={searchQuery}
        />
      </div>
      <div className="px-8 py-6">
        {isFirstPrompt && (
          <div className="flex flex-col items-center justify-center h-[400px] space-y-10">
            <h1 className="text-center text-5xl font-bold">
              <span className="bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">
                Hello, {user?.firstName}
              </span>
            </h1>
            <h3 className="text-center text-sm font-bold w-[450px]">
              <span className="bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent ">
                I can help create diagrams from your descriptions. Tell me about
                your system's architecture. Describe the parts and how they
                connect, and I'll generate a diagram.
              </span>
            </h3>
          </div>
        )}

        {searchQuery && !isSearching && !isFirstPrompt && (
          <div className="mb-6">
            <div className="bg-gray-50 rounded-3xl py-4">
              <div className="max-w-4xl mx-auto px-8">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="w-5 h-5">
                    <AvatarImage
                      src="/gemini-logo.png"
                      alt="Bot Avatar"
                      fallback="AI"
                    />
                  </Avatar>
                  <h2 className="text-[12px] text-gray-600">
                    Generative AI may display inaccurate information, including
                    about people, so double-check its responses.
                  </h2>
                </div>
                {isMermaidCode(mermaidCode) && (
                  <div className="mb-4">
                    <Mermaid chart={extractMermaidCode(mermaidCode) || ""} />
                  </div>
                )}
                <div className="space-y-4">
                  <FeedbackActions
                    onCopy={handleCopy}
                    onFeedback={handleFeedback}
                    isPlaying={isPlaying}
                    onListen={handleListen}
                    onPause={handlePause}
                    onRegenerate={handleRegenerate}
                    onDownload={handleDownload}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        {isSearching && <p className="text-blue-500/70">{loadingText}</p>}
      </div>
      {!isSearching && !isFirstPrompt && (
        <div className="p-4 mx-8 rounded-[2rem] bg-white text-gray-600">
          <MessageBubble message={mermaidCode} />
        </div>
      )}
    </main>
  );
}

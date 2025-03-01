"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Copy,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  ArrowRight,
  Volume2,
  PauseCircle,
} from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { SearchResults } from "@/components/search-results";
import { useToastHandlers } from "@/hooks/toast";
import { UserNav } from "@/components/user-nav";
import { sendSearchQuery, SearchResponse, SearchResultDocument } from "@/lib/api";
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

interface MessageBubbleProps {
  message: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  return (
    <div className="p-4 rounded-3xl bg-gray-50 text-gray-600">
      <ReactMarkdown
        rehypePlugins={[rehypeRaw]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
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
        {message}
      </ReactMarkdown>
    </div>
  );
};

interface FeedbackActionsProps {
  onCopy: () => void;
  onFeedback: (type: "up" | "down") => void;
  isPlaying: boolean;
  onListen: () => void;
  onPause: () => void;
}

const FeedbackActions: React.FC<FeedbackActionsProps> = ({
  onCopy,
  onFeedback,
  isPlaying,
  onListen,
  onPause,
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
            <p>Copy Summary</p>
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
            <p>{isPlaying ? "Pause Audio" : "Listen to Summary"}</p>
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
  const [summary, setSummary] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResultDocument[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioRef, setAudioRef] = useState<SpeechSynthesisUtterance | null>(
    null
  );
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { handleCopyToast, handleAudioToast, handleFeedbackToast } =
    useToastHandlers();
  const [loadingText, setLoadingText] = useState("Search...");

  useEffect(() => {
    if (isSearching) {
      const intervalId = setInterval(() => {
        setLoadingText((prevText) =>
          prevText === "Search..." ? "Thinking..." : "Search..."
        );
      }, 1000); // Change every 1 second

      return () => clearInterval(intervalId); // Cleanup on unmount or when isSearching changes
    } else {
        setLoadingText("Search...")
    }
  }, [isSearching]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
    setSummary("");
    setSearchResults([]);

    try {
      const searchResponse: SearchResponse = await sendSearchQuery(query);
      setSummary(searchResponse.summary || "No summary available.");
      setSearchResults(searchResponse.results);
    } catch (error) {
      console.error("Search error:", error);
      setSummary("Error occurred while fetching summary.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCopy = async () => {
    await handleCopyToast(summary);
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

    const utterance = new SpeechSynthesisUtterance(summary);
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

  const handleFollowUpClick = (question: string) => {
    setSearchQuery(question);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
      handleSearch(question);
    }
  };

  return (
    <main className="flex-1 mt-0 max-w-3xl mx-auto w-full">
      <div className="flex justify-end  py-6">
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
        {searchQuery && !isSearching && (
          <div className="mb-6">
          <div className="bg-gray-50 rounded-3xl py-4">
            <div className="max-w-4xl mx-auto px-8">
              <div className="flex items-center gap-2 mb-2"> {/* NEW: Flex container */}
               <Avatar className="w-5 h-5">
                <AvatarImage
                  src="/gemini-logo.png"
                  alt="Bot Avatar"
                  fallback="AI"
                />
              </Avatar>
                <h2 className="text-[12px] text-gray-600"> {/* NEW: Moved here */}
                  Generative AI may display inaccurate information, including
                  about people, so double-check its responses.
                </h2>
              </div> {/* NEW: Flex container */}
              <MessageBubble message={summary} />

                <div className="space-y-4">
                  <FeedbackActions
                    onCopy={handleCopy}
                    onFeedback={handleFeedback}
                    isPlaying={isPlaying}
                    onListen={handleListen}
                    onPause={handlePause}
                  />

                  <div className="flex flex-wrap gap-3 ">
                    {[
                      "Follow-up suggestion 1",
                      "Follow-up suggestion 2",
                    ].map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2  border-blue-100 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-3xl"
                        onClick={() => handleFollowUpClick(question)}
                      >
                        <ArrowRight className="h-4 w-4" />
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
         {isSearching && <p className="text-blue-500/70">{loadingText}</p>}
        <SearchResults
          query={searchQuery}
          isSearching={isSearching}
          searchResults={searchResults}
        />
      </div>
    </main>
  );
}

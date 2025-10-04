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

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { Copy, MoreHorizontal, Pause, RotateCcw, Volume2 } from "lucide-react";
import React from "react";

interface MessageActionsProps {
  message: string;
  onResend?: () => void;
}

export function MessageActions({ message, onResend }: MessageActionsProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [audioRef, setAudioRef] =
    React.useState<SpeechSynthesisUtterance | null>(null);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(message)
      .then(() => {
        toast({
          title: "Copied to clipboard",
          description: "The message has been copied.",
          duration: 3000,
          className:
            "bottom-0 left-0 fixed mb-4 ml-4 bg-blue-50 dark:bg-gray-800/80 rounded-3xl shadow-[0_3px_3px_-1px_rgba(5,0.7,.7,0.4)] text-gray-600 dark:text-gray-300",
        });
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        toast({
          title: "Copy failed",
          description: "Failed to copy the message. Please try again.",
          variant: "destructive",
          duration: 3000,
          className:
            "bottom-0 left-0 fixed mb-4 ml-4 bg-blue-50 dark:bg-gray-800/80 rounded-3xl shadow-[0_3px_3px_-1px_rgba(5,0.7,.7,0.4)] text-red-600 dark:text-red-300",
        });
      });
  };

  const handlePlay = () => {
    if (audioRef) {
      window.speechSynthesis.resume();
    } else {
      const utterance = new SpeechSynthesisUtterance(message);
      setAudioRef(utterance);
      utterance.onend = () => {
        setIsPlaying(false);
        setAudioRef(null);
      };
      window.speechSynthesis.speak(utterance);
    }
    setIsPlaying(true);
    toast({
      title: "Audio playing",
      description: "The message is being read aloud.",
      duration: 3000,
      className:
        "bottom-0 left-0 fixed mb-4 ml-4 bg-blue-50 dark:bg-gray-800/80 rounded-3xl shadow-[0_3px_3px_-1px_rgba(5,0.7,.7,0.4)] text-gray-600 dark:text-gray-300",
    });
  };

  const handlePause = () => {
    if (audioRef) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
      toast({
        title: "Audio paused",
        description: "The audio has been paused.",
        duration: 3000,
        className:
          "bottom-0 left-0 fixed mb-4 ml-4 bg-blue-50 dark:bg-gray-800/80 rounded-3xl shadow-[0_3px_3px_-1px_rgba(5,0.7,.7,0.4)] text-gray-600 dark:text-gray-300",
      });
    }
  };

  const handleResend = () => {
    if (onResend) {
      onResend();
      toast({
        title: "Regenerating diagram",
        description: "Asking the agent to regenerate the diagram.",
        duration: 3000,
        className:
          "bottom-0 left-0 fixed mb-4 ml-4 bg-blue-50 dark:bg-gray-800/80 rounded-3xl shadow-[0_3px_3px_-1px_rgba(5,0.7,.7,0.4)] text-gray-600 dark:text-gray-300",
      });
    }
  };

  const handleFeedback = (type: "up" | "down") => {
    console.log(`Feedback: ${type}`);
    toast({
      title: "Thank you for your feedback!",
      description: `We appreciate your ${
        type === "up" ? "positive" : "negative"
      } feedback.`,
      duration: 3000,
      className:
        "bottom-0 left-0 fixed mb-4 ml-4 bg-blue-50 dark:bg-gray-800/80 rounded-3xl shadow-[0_3px_3px_-1px_rgba(5,0.7,.7,0.4)] text-gray-600 dark:text-gray-300",
    });
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      <button
        onClick={handleCopy}
        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
        title="Copy message"
      >
        <Copy className="h-4 w-4 text-gray-600 dark:text-gray-300" />
      </button>
      {onResend && (
        <button
          onClick={handleResend}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
          title="Regenerate diagram"
        >
          <RotateCcw className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </button>
      )}
      {/*<button
        onClick={() => handleFeedback("up")}
        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
      >
         
        <ThumbsUp className="h-4 w-4 text-gray-600 dark:text-gray-300" />
      </button>
      <button
        onClick={() => handleFeedback("down")}
        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
      >
        <ThumbsDown className="h-4 w-4 text-gray-600 dark:text-gray-300" />
      </button> */}
      {isPlaying ? (
        <button
          onClick={handlePause}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <Pause className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </button>
      ) : (
        <button
          onClick={handlePlay}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <Volume2 className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </button>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
            <MoreHorizontal className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleCopy}>
            <Copy className="mr-2 h-4 w-4" />
            <span>Copy</span>
          </DropdownMenuItem>
          {onResend && (
            <DropdownMenuItem onClick={handleResend}>
              <RotateCcw className="mr-2 h-4 w-4" />
              <span>Regenerate diagram</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

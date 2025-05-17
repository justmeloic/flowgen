import {
  Copy,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  VolumeIcon as VolumeUp,
  Pause,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React from "react";

interface MessageActionsProps {
  message: string;
}

export function MessageActions({ message }: MessageActionsProps) {
  const { toast } = useToast();
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
          className: "bottom-0 left-0 fixed mb-4 ml-4",
        });
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        toast({
          title: "Copy failed",
          description: "Failed to copy the message. Please try again.",
          variant: "destructive",
          duration: 3000,
          className: "bottom-0 left-0 fixed mb-4 ml-4",
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
      className: "bottom-0 left-0 fixed mb-4 ml-4",
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
        className: "bottom-0 left-0 fixed mb-4 ml-4",
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
      className: "bottom-0 left-0 fixed mb-4 ml-4",
    });
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      <button
        onClick={handleCopy}
        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
      >
        <Copy className="h-4 w-4 text-gray-600" />
      </button>
      <button
        onClick={() => handleFeedback("up")}
        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
      >
        <ThumbsUp className="h-4 w-4 text-gray-600" />
      </button>
      <button
        onClick={() => handleFeedback("down")}
        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
      >
        <ThumbsDown className="h-4 w-4 text-gray-600" />
      </button>
      {isPlaying ? (
        <button
          onClick={handlePause}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <Pause className="h-4 w-4 text-gray-600" />
        </button>
      ) : (
        <button
          onClick={handlePlay}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <VolumeUp className="h-4 w-4 text-gray-600" />
        </button>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <MoreHorizontal className="h-4 w-4 text-gray-600" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleCopy}>
            <Copy className="mr-2 h-4 w-4" />
            <span>Copy</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

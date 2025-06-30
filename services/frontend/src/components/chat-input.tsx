"use client";

import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Mic, Plus, SendHorizontal, Square } from "lucide-react";
import * as React from "react";
import { FileChip } from "./file-chip";

interface UploadedFile {
  id: string;
  file: File;
}

interface ChatInputProps extends React.HTMLAttributes<HTMLFormElement> {
  onSend: (userMessage: string, audioUrl: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function ChatInput({
  className,
  onSend,
  isLoading = false,
  disabled = false,
  ...props
}: ChatInputProps) {
  const [isFocused, setIsFocused] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>([]);
  const [isRecording, setIsRecording] = React.useState(false);
  const [audioBlob, setAudioBlob] = React.useState<Blob | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<BlobPart[]>([]);

  // Auto-resize textarea
  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.max(48, textarea.scrollHeight)}px`;
    }
  }, [message]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (message.trim() && !isLoading) {
      const userMessage = message;
      setMessage("");
      onSend(userMessage, "");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (message.trim() && !isLoading) {
        handleSubmit(event as any);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files).map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
      }));
      setUploadedFiles((prev) => [...prev, ...newFiles]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const startRecording = async () => {
    try {
      console.log("Requesting microphone permission...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Permission granted, creating MediaRecorder...");
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log("Recording stopped, processing audio...");
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        setAudioBlob(audioBlob);
        const newFile = new File([audioBlob], "recording.wav", {
          type: "audio/wav",
        });
        setUploadedFiles((prev) => [
          ...prev,
          { id: Math.random().toString(36).substr(2, 9), file: newFile },
        ]);
        console.log("Audio processed and added to uploaded files");
      };

      mediaRecorder.start();
      setIsRecording(true);
      console.log("Recording started");
      toast({
        title: "Recording started",
        description: "Speak now. Click the stop button when you're done.",
      });
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Recording failed",
        description: "Please make sure you've granted microphone permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      console.log("Recording stopped");
      toast({
        title: "Recording stopped",
        description: "Your audio has been added to the chat.",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("relative w-full max-w-[70%] mx-auto", className)}
      {...props}
    >
      <div
        className={cn(
          "relative flex flex-col w-full min-h-28 rounded-3xl border bg-white transition-shadow duration-300 ease-in-out",
          isFocused
            ? "shadow-[0_1px_6px_1px_rgba(32,33,36,0.12),0_1px_8px_2px_rgba(32,33,36,0.12),0_1px_12px_3px_rgba(32,33,36,0.2)]"
            : "shadow-none"
        )}
      >
        {/* Top section with textarea input */}
        <textarea
          ref={textareaRef}
          placeholder="Ask Gemini"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="min-h-12 w-full rounded-t-3xl bg-transparent px-4 py-3 text-base outline-none placeholder:text-muted-foreground resize-none overflow-hidden"
          rows={1}
        />

        {/* Bottom section with buttons */}
        <div className="flex justify-between items-center mt-auto mb-4 px-2">
          {/* File upload button */}
          <div className="flex items-center">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="chat-file-upload"
            />
            <label
              htmlFor="chat-file-upload"
              className={cn(
                "flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors  ",
                "hover:bg-gradient-to-r from-blue-500/20 to-pink-500/20 focus:bg-gray-100 focus:outline-none"
              )}
            >
              <Plus className="h-5 w-5 text-gray-600" />
              <span className="sr-only">Upload files</span>
            </label>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                isRecording
                  ? "bg-red-500 hover:bg-red-600"
                  : "text-gray-600 hover:bg-gradient-to-r from-blue-500/20 to-pink-500/20",
                "focus:outline-none"
              )}
            >
              {isRecording ? (
                <Square className="h-4 w-4 text-white" />
              ) : (
                <Mic className="h-5 w-5 text-gray-600" />
              )}
              <span className="sr-only">
                {isRecording ? "Stop recording" : "Start recording"}
              </span>
            </button>
            {message.trim() && !isLoading ? (
              <button
                type="submit"
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
                  "bg-blue-100 hover:bg-blue-200 focus:bg-blue-200 focus:outline-none"
                )}
              >
                <SendHorizontal className="h-4 w-4 text-gray-800" />
                <span className="sr-only">Send message</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>
      {uploadedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {uploadedFiles.map(({ id, file }) => (
            <FileChip
              key={id}
              fileName={file.name}
              fileSize={file.size}
              fileType={file.type || "application/octet-stream"}
              onRemove={() => handleRemoveFile(id)}
            />
          ))}
        </div>
      )}
    </form>
  );
}

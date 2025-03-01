"use client";

import * as React from "react";
import { useEffect } from "react";
import Link from "next/link";
import { Plus, Search, SendHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { FileChip } from "./file-chip";
import { SearchSuggestions } from "./search-suggestions";

interface SearchBarProps extends React.HTMLAttributes<HTMLFormElement> {
  onSearch: (query: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  externalQuery: string;
}

interface UploadedFile {
  id: string;
  file: File;
}

// Example suggestions - in a real app, these might come from props or an API
const defaultSuggestions = [
  { text: "Chat with files", icon: "plus" as const },
  {
    text: "How does equity compensation work?",
    icon: "none" as const,
  },
  { text: "What are the company values?", icon: "none" as const },
];

export function SearchBar({
  className,
  onSearch,
  inputRef,
  externalQuery,
  ...props
}: SearchBarProps) {
  const [query, setQuery] = React.useState(externalQuery || "");
  const [isFocused, setIsFocused] = React.useState(false);
  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(true);
  const [hasSearched, setHasSearched] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(externalQuery || "");
  }, [externalQuery]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (query && query.trim()) {
      onSearch(query);
      setHasSearched(true);
      setShowSuggestions(false);
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

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
  };

  return (
    <div className="space-y-10">
      <Link
        href="/"
        className="mx-auto mb-6 flex h-8 w-8 items-center justify-center"
      >
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
      <form
        onSubmit={handleSubmit}
        className={cn("relative w-full max-w-4xl mx-auto", className)}
        {...props}
      >
        <div
          className={cn(
            "relative flex items-center w-full rounded-full border bg-white transition-shadow duration-300 ease-in-out",
            isFocused
              ? "shadow-[0_1px_6px_0px_rgba(32,33,36,0.12),0_3px_8px_2px_rgba(32,33,36,0.14),0_3px_12px_3px_rgba(32,33,36,0.2)]"
              : "shadow-none"
          )}
        >
          <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search content or ask questions"
            value={query || ""}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="h-12 w-full rounded-full bg-transparent pl-12 pr-20 text-base outline-none placeholder:text-muted-foreground"
          />
          <div className="absolute right-2 flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className={cn(
                "flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors border border-gray-300 bg-gray-50",
                "hover:bg-primary/30 focus:bg-gray-100 focus:outline-none"
              )}
            >
              <Plus className="h-5 w-5 text-gray-600" />
              <span className="sr-only">Upload files</span>
            </label>
            {query && query.trim() && (
              <button
                type="submit"
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                  "bg-primary hover:bg-primary/90 focus:bg-primary/90 focus:outline-none"
                )}
              >
                <SendHorizontal className="h-4 w-4 text-white" />
                <span className="sr-only">Search</span>
              </button>
            )}
          </div>
        </div>
        {showSuggestions && !hasSearched && (
          <SearchSuggestions
            suggestions={defaultSuggestions}
            onSuggestionClick={handleSuggestionClick}
            onSearch={(query) => {
              onSearch(query);
              setHasSearched(true);
              setShowSuggestions(false);
            }}
          />
        )}
      </form>
      {uploadedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4">
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
    </div>
  );
}

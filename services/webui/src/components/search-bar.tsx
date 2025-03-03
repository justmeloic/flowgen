"use client";

import * as React from "react";
import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Plus, Search, SendHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { FileChip } from "./file-chip";
import { SearchSuggestions } from "./search-suggestions";
import Image from "next/image";
import {
  isFileTypeSupported,
  getSupportedFileTypesText,
} from "@/lib/file-utils";
import { toast } from "sonner";

interface SearchBarProps extends React.HTMLAttributes<HTMLFormElement> {
  onSearch: (query: string, files?: File[]) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  externalQuery: string;
}

interface UploadedFile {
  id: string;
  file: File;
}

const defaultSuggestions = [
  {
    text: "Basic client-server-database interaction",
    icon: "plus" as const,
  },
  {
    text: "Generate an API gateway pattern with a cache",
    icon: "plus" as const,
  },
];

export function SearchBar({
  className,
  onSearch,
  inputRef,
  externalQuery,
  ...props
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [internalQuery, setInternalQuery] = useState(externalQuery || "");

  useEffect(() => {
    setInternalQuery(externalQuery || "");
  }, [externalQuery]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (internalQuery && internalQuery.trim()) {
      console.log(
        "files",
        uploadedFiles.map((file) => file.file)
      );
      console.log("Sending query to search:", internalQuery);
      onSearch(
        internalQuery,
        uploadedFiles.map((uploadedFile) => uploadedFile.file)
      );
      setHasSearched(true);
      setShowSuggestions(false);
      setUploadedFiles([]);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsReadingFile(true);
    setShowSuggestions(false);
    const files = event.target.files;
    if (files) {
      const unsupportedFiles = Array.from(files).filter(
        (file) => !isFileTypeSupported(file.name)
      );

      if (unsupportedFiles.length > 0) {
        const fileNames = unsupportedFiles.map((f) => f.name).join(", ");
        toast.error(
          `You tried uploading an unsupported file type: ${fileNames}. Only ${getSupportedFileTypesText()} files are supported.`,
          {
            duration: 6000,
            className: "bg-red-100 border border-none text-red-800 rounded-3xl",
          }
        );

        // Filter out unsupported files
        const supportedFiles = Array.from(files)
          .filter((file) => isFileTypeSupported(file.name))
          .map((file) => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
          }));

        setUploadedFiles((prev) => [...prev, ...supportedFiles]);
      } else {
        const newFiles = Array.from(files).map((file) => ({
          id: Math.random().toString(36).substr(2, 9),
          file,
        }));
        setUploadedFiles((prev) => [...prev, ...newFiles]);
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setIsReadingFile(false);
  };

  const handleRemoveFile = (fileId: string) => {
    if (uploadedFiles.length === 1) {
      setShowSuggestions(true);
    }
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInternalQuery(suggestion);
  };

  return (
    <div className="space-y-10">
      <Link href="/" className="mx-auto mb-16 flex items-center justify-center">
        <div className="h-[35px] w-[35px]">
          <Image
            src="/logo.png"
            alt="Logo"
            width={35}
            height={35}
            sizes="100vw"
            style={{ objectFit: "contain" }}
          />
        </div>
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
            placeholder="Describe your system architecture"
            value={internalQuery || ""}
            onChange={(e) => setInternalQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="h-12 w-full rounded-full bg-transparent pl-12 pr-20 text-base  outline-none placeholder:text-gray-500/60"
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
              {isReadingFile ? (
                <div className="animate-pulse">
                  <Plus className="h-5 w-5 text-gray-600" />
                </div>
              ) : (
                <Plus className="h-5 w-5 text-gray-600" />
              )}
              <span className="sr-only">Upload files</span>
            </label>
            {internalQuery && internalQuery.trim() && (
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
            onSearch={(query, files) => {
              onSearch(query, files);
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

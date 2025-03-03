"use client";

import * as React from "react";
import { File, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileChipProps extends React.HTMLAttributes<HTMLDivElement> {
  fileName: string;
  fileSize: number;
  fileType: string;
  onRemove: () => void;
}

export function FileChip({
  className,
  fileName,
  fileSize,
  fileType,
  onRemove,
  ...props
}: FileChipProps) {
  const formattedSize = React.useMemo(() => {
    if (fileSize < 1024) return `${fileSize}B`;
    if (fileSize < 1024 * 1024) return `${(fileSize / 1024).toFixed(1)}KB`;
    return `${(fileSize / (1024 * 1024)).toFixed(1)}MB`;
  }, [fileSize]);

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-400/50 to-pink-400/50 px-3 py-2 text-sm", //bg-blue-100/90
        className
      )}
      {...props}
    >
      <File className="h-4 w-4 text-blue-600" />
      <span className="text-gray-700">{fileName}</span>
      <span className="text-gray-500">
        {fileType} {formattedSize}
      </span>
      <button
        onClick={onRemove}
        className="ml-2 rounded-full p-1 hover:bg-blue-100"
      >
        <X className="h-3 w-3 text-gray-500" />
        <span className="sr-only">Remove file</span>
      </button>
    </div>
  );
}

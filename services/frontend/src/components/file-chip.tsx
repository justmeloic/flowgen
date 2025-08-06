/**
 * Copyright 2025 Loïc Muhirwa
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

"use client"

import * as React from "react"
import { File, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileChipProps extends React.HTMLAttributes<HTMLDivElement> {
  fileName: string
  fileSize: number
  fileType: string
  onRemove: () => void
}

export function FileChip({ className, fileName, fileSize, fileType, onRemove, ...props }: FileChipProps) {
  const formattedSize = React.useMemo(() => {
    if (fileSize < 1024) return `${fileSize}B`
    if (fileSize < 1024 * 1024) return `${(fileSize / 1024).toFixed(1)}KB`
    return `${(fileSize / (1024 * 1024)).toFixed(1)}MB`
  }, [fileSize])

  return (
    <div className={cn("flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm", className)} {...props}>
      <File className="h-4 w-4 text-blue-600" />
      <span className="text-gray-700">{fileName}</span>
      <span className="text-gray-500">
        {fileType} {formattedSize}
      </span>
      <button onClick={onRemove} className="ml-2 rounded-full p-1 hover:bg-blue-100">
        <X className="h-3 w-3 text-gray-500" />
        <span className="sr-only">Remove file</span>
      </button>
    </div>
  )
}


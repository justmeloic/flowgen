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

"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";
import * as React from "react";

interface PlatformSelectorProps {
  selectedPlatform?: string | null;
  onPlatformChange: (platform: string | null) => void;
}

const PLATFORMS = [
  { value: "general", label: "General" },
  { value: "gcp", label: "GCP" },
  { value: "aws", label: "AWS" },
  { value: "azure", label: "Azure" },
];

export function PlatformSelector({
  selectedPlatform,
  onPlatformChange,
}: PlatformSelectorProps) {
  const [open, setOpen] = React.useState(false);

  const current = React.useMemo(
    () => PLATFORMS.find((p) => p.value === (selectedPlatform || "")),
    [selectedPlatform]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="w-auto h-15 rounded-2xl justify-between bg-blue-100/80 dark:bg-chatInput-dark hover:bg-gray-200 dark:hover:bg-[#2d2e2f] border-none shadow-none focus:ring-0 focus:outline-none px-4"
        >
          <div className="flex flex-col items-start min-w-0">
            <span className="text-xs text-muted-foreground dark:text-gray-400 whitespace-nowrap">
              {current?.label || "Select Platform"}
            </span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 rounded-2xl p-1 bg-accent dark:bg-[#2d2e2f] dark:border-[#404142] shadow-[0_3px_3px_-1px_rgba(5,0.7,.7,0.4)] dark:shadow-[0_4px_8px_0_rgba(0,0,0,0.4)]">
        <Command className="dark:bg-[#2d2e2f] rounded-xl">
          <CommandInput placeholder="Search platforms..." />
          <CommandList className="dark:bg-[#2d2e2f]">
            <CommandEmpty className="dark:text-gray-400">
              No platform found.
            </CommandEmpty>
            <CommandGroup className="dark:bg-[#2d2e2f]">
              {PLATFORMS.map((platform) => (
                <CommandItem
                  key={platform.value}
                  value={platform.value}
                  onSelect={(val) => {
                    const chosen =
                      PLATFORMS.find((p) => p.value === val)?.value || null;
                    onPlatformChange(chosen);
                    setOpen(false);
                  }}
                  className="dark:text-gray-200 dark:hover:bg-[#3c4043] rounded-2xl"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 dark:text-gray-300",
                      selectedPlatform === platform.value
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col items-start w-full">
                    <span className="dark:text-gray-200 font-medium text-sm">
                      {platform.label}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

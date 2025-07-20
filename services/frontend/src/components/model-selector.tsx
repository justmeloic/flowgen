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

const models = [
  {
    value: "gemini-2.5-flash",
    label: "Gemini",
    description: "2.5 Flash",
  },
];

export function ModelSelector() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("gemini-2.5-flash");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="w-x-auto h-15 rounded-2xl justify-between bg-chatInput-light dark:bg-chatInput-dark hover:bg-gray-200 dark:hover:bg-[#2d2e2f] border-none shadow-none focus:ring-0 focus:outline-none"
        >
          <div className="flex flex-col items-start truncate">
            <span className="text-base font-medium dark:text-gray-200">
              {models.find((model) => model.value === value)?.label}
            </span>
            <span className="text-xs text-muted-foreground dark:text-gray-400">
              {models.find((model) => model.value === value)?.description}
            </span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[270px] rounded-2xl p-1 bg-accent dark:bg-[#2d2e2f] dark:border-[#404142] shadow-[0_3px_3px_-1px_rgba(5,0.7,.7,0.4)] dark:shadow-[0_4px_8px_0_rgba(0,0,0,0.4)]">
        <Command className="dark:bg-[#2d2e2f] rounded-xl">
          <CommandInput placeholder="Search models..." />
          <CommandList className="dark:bg-[#2d2e2f]">
            <CommandEmpty className="dark:text-gray-400">
              No model found.
            </CommandEmpty>
            <CommandGroup className="dark:bg-[#2d2e2f]">
              {models.map((model) => (
                <CommandItem
                  key={model.value}
                  value={model.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue);
                    setOpen(false);
                  }}
                  className="dark:text-gray-200 dark:hover:bg-[#3c4043] rounded-lg"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 dark:text-gray-300",
                      value === model.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col items-start">
                    <span className="dark:text-gray-200 font-medium">
                      {model.label}
                    </span>
                    <span className="text-xs text-muted-foreground dark:text-gray-400">
                      {model.description}
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

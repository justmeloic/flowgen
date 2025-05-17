"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
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

const models = [
  {
    value: "gemini-2.0-flash",
    label: "Gemini",
    description: "2.0 Flash",
  },
];

export function ModelSelector() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("gemini-2.0-flash");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="w-x-auto h-15 rounded-2xl justify-between bg-white hover:bg-gray-200 border-none shadow-none focus:ring-0 focus:outline-none"
        >
          <div className="flex flex-col items-start truncate">
            <span className="text-base font-medium">
              {models.find((model) => model.value === value)?.label}
            </span>
            <span className="text-xs text-muted-foreground">
              {models.find((model) => model.value === value)?.description}
            </span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[270px] rounded-2xl p-1 bg-accent shadow-[0_3px_3px_-1px_rgba(5,0.7,.7,0.4)]">
        <Command>
          <CommandInput placeholder="Search models..." />
          <CommandList>
            <CommandEmpty>No model found.</CommandEmpty>
            <CommandGroup>
              {models.map((model) => (
                <CommandItem
                  key={model.value}
                  value={model.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === model.value ? "opacity-70" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col items-start">
                    <span>{model.label}</span>
                    <span className="text-xs text-muted-foreground ">
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

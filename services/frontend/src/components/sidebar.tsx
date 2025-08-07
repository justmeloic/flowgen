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

"use client";

import { BookOpen, MessageSquare, RefreshCw } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type * as React from "react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { startNewSession } from "@/lib/api";
import { cn } from "@/lib/utils";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ className, isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const [isStartingNew, setIsStartingNew] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 150);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(false);
  };

  const handleNewSession = () => {
    setIsStartingNew(true);
    try {
      // Clear the session ID to start a new session
      startNewSession();

      // Dispatch a custom event to notify other components (like the chat page)
      window.dispatchEvent(new CustomEvent("newSessionStarted"));

      console.log("New session started");
      // Show success feedback for a moment
      setTimeout(() => setIsStartingNew(false), 1500);
    } catch (error) {
      console.error("Error starting new session:", error);
      setIsStartingNew(false);
    }
  };

  const sidebarLinks = [
    {
      title: "Agent Chat",
      icon: MessageSquare,
      variant: "default",
      href: "/",
    },
  ] as const;

  return (
    <div
      className={cn(
        "relative flex h-screen flex-col gap-4 px-3 pb-3 pt-16 transition-all duration-300 bg-secondary dark:bg-secondary-dark shadow-[2px_0_10px_0_rgba(0,0,0,0.1)] dark:shadow-none z-10 rounded-tr-xl rounded-br-xl border-r border-gray-200 dark:border-[#2f2f2f]",
        isCollapsed && !isHovered ? "w-[80px]" : "w-[250px]",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <TooltipProvider>
        <Button
          variant="ghost"
          className={cn(
            "absolute top-4 p-2 hover:bg-white/50 dark:hover:bg-gray-700/50",
            isCollapsed && !isHovered ? "left-1/2 -translate-x-1/2" : "left-4"
          )}
          onClick={onToggle}
        >
          <div className="flex flex-col space-y-1">
            <span className="w-4 h-0.5 bg-current"></span>
            <span className="w-4 h-0.5 bg-current"></span>
            <span className="w-4 h-0.5 bg-current"></span>
          </div>
          <span className="sr-only">Toggle Sidebar</span>
        </Button>

        {/* Navigation buttons grouped together */}
        <nav className="grid gap-4 mt-16">
          {/* New Session button */}
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={handleNewSession}
                disabled={isStartingNew}
                className={cn(
                  "flex items-center text-muted-foreground hover:bg-white/50 dark:hover:bg-gray-700/50 w-full transition-colors",
                  isStartingNew && "opacity-50 cursor-not-allowed",
                  !isCollapsed || isHovered
                    ? "gap-3 rounded-2xl px-3 py-2"
                    : "justify-center rounded-md p-2"
                )}
              >
                <RefreshCw
                  className={cn("h-6 w-6", isStartingNew && "animate-spin")}
                />
                {!isCollapsed || isHovered ? (
                  isStartingNew ? (
                    "Starting..."
                  ) : (
                    "New conversation"
                  )
                ) : (
                  <span className="sr-only">Start New Session</span>
                )}
              </button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent
                side="right"
                className="flex items-center gap-4 max-w-xs rounded-2xl bg-secondary dark:bg-secondary-dark px-3 py-1.5 shadow-[0_3px_3px_-1px_rgba(5,0.7,.7,0.4)]"
              >
                Start a new session by clearing the current session ID. This
                will create a new conversation context.
              </TooltipContent>
            )}
          </Tooltip>

          {/* Agent Chat links */}
          {sidebarLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <Link
                key={index}
                href={link.href}
                className={cn(
                  "flex items-center text-muted-foreground hover:bg-white/50 dark:hover:bg-gray-700/50",
                  pathname === link.href &&
                    "bg-[#d3e2fd] dark:bg-gray-700 text-primary dark:text-blue-400 hover:bg-[#d3e2fd]/90 dark:hover:bg-gray-600",
                  !isCollapsed || isHovered
                    ? "gap-3 rounded-2xl px-3 py-2"
                    : "justify-center rounded-md p-2"
                )}
              >
                <Icon className="h-5 w-5" />
                {!isCollapsed || isHovered ? (
                  link.title
                ) : (
                  <span className="sr-only">{link.title}</span>
                )}
              </Link>
            );
          })}

          {/* Documentation link */}
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Link
                href="/doc"
                className={cn(
                  "flex items-center text-muted-foreground hover:bg-white/50 dark:hover:bg-gray-700/50",
                  pathname === "/doc" &&
                    "bg-[#d3e2fd] dark:bg-gray-700 text-primary dark:text-blue-400 hover:bg-[#d3e2fd]/90 dark:hover:bg-gray-600",
                  !isCollapsed || isHovered
                    ? "gap-3 rounded-2xl px-3 py-2"
                    : "justify-center rounded-md p-2"
                )}
              >
                <BookOpen className="h-5 w-5" />
                {!isCollapsed || isHovered ? (
                  "Documentation"
                ) : (
                  <span className="sr-only">Documentation</span>
                )}
              </Link>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent
                side="right"
                className="flex items-center gap-4 max-w-xs rounded-2xl bg-secondary dark:bg-secondary-dark px-3 py-1.5 shadow-[0_3px_3px_-1px_rgba(5,0.7,.7,0.4)]"
              >
                Access detailed project documentation, including code, system
                architecture, and more.
              </TooltipContent>
            )}
          </Tooltip>
        </nav>
      </TooltipProvider>
    </div>
  );
}

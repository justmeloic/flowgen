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

import {
  BookOpen,
  MessageSquare,
  Moon,
  RefreshCw,
  Settings2,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type * as React from "react";
import { useEffect, useState } from "react";

import { startNewSession } from "@/lib/api";
import { cn } from "@/lib/utils";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ className, isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [isStartingNew, setIsStartingNew] = useState(false);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(!isCollapsed);
  const { theme, setTheme } = useTheme();

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle sidebar visibility with animation delay
  useEffect(() => {
    if (!isCollapsed) {
      setShouldRender(true);
    } else {
      // Delay hiding to allow exit animation
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isCollapsed]);

  const handleToggle = () => {
    setIsAnimating(true);
    onToggle();

    // Reset animation state after animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
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
      title: "Architecture Agent",
      icon: MessageSquare,
      variant: "default",
      href: "/",
    },
  ] as const;

  return (
    <>
      {/* Floating expand button - show when collapsed */}
      {isCollapsed && (
        <button
          onClick={handleToggle}
          className="fixed top-24 left-4 z-50 p-3 bg-blue-100 dark:bg-gray-700 rounded-full hover:bg-blue-200 dark:hover:bg-gray-600 transition-all duration-300 ease-in-out shadow-lg"
          aria-label="Expand sidebar"
        >
          <svg
            className="w-5 h-5 text-gray-600 dark:text-gray-300 transition-transform duration-300 ease-in-out"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}

      {/* Full sidebar - show when expanded */}
      {shouldRender && (
        <div
          className={cn(
            "fixed left-0 top-20 flex h-[calc(100vh-80px)] flex-col gap-4 px-3 pb-3 pt-4 bg-secondary dark:bg-secondary-dark shadow-[2px_0_10px_0_rgba(0,0,0,0.1)] dark:shadow-none z-10 rounded-tr-xl rounded-br-xl w-[250px]",
            !isCollapsed
              ? "animate-in slide-in-from-left-full duration-500 ease-in-out"
              : "animate-out slide-out-to-left-full duration-500 ease-in-out",
            className
          )}
        >
          {/* Collapse button - same style as expand button but with left-facing arrow */}
          <button
            onClick={handleToggle}
            className="absolute top-4 right-4 z-10 p-3 bg-blue-100 dark:bg-gray-700 rounded-full hover:bg-blue-200 dark:hover:bg-gray-600 transition-all duration-300 ease-in-out shadow-lg"
            aria-label="Collapse sidebar"
          >
            <svg
              className="w-5 h-5 text-gray-600 dark:text-gray-300 transition-transform duration-300 ease-in-out"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Navigation buttons grouped together */}
          <nav className="grid gap-4 mt-16">
            {/* New Session button */}
            <button
              onClick={handleNewSession}
              disabled={isStartingNew}
              className={cn(
                "flex items-center text-muted-foreground hover:bg-white/50 dark:hover:bg-gray-700/50 w-full transition-colors gap-3 rounded-2xl px-3 py-2",
                isStartingNew && "opacity-50 cursor-not-allowed"
              )}
            >
              <RefreshCw
                className={cn("h-5 w-4", isStartingNew && "animate-spin")}
              />
              <span className="text-sm hidden md:inline">
                {isStartingNew ? "Starting..." : "New Conversation"}
              </span>
            </button>

            {/* Agent Chat links */}
            {sidebarLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <Link
                  key={index}
                  href={link.href}
                  className={cn(
                    "flex items-center text-muted-foreground hover:bg-white/50 dark:hover:bg-gray-700/50 gap-3 rounded-2xl px-3 py-2",
                    pathname === link.href &&
                      "bg-[#d3e2fd] dark:bg-gray-700 text-primary dark:text-blue-400 hover:bg-[#d3e2fd]/90 dark:hover:bg-gray-600"
                  )}
                >
                  <Icon className="h-5 w-4" />
                  <span className="text-sm hidden md:inline">{link.title}</span>
                </Link>
              );
            })}

            {/* Documentation link */}
            <Link
              href="/doc"
              className={cn(
                "flex items-center text-muted-foreground hover:bg-white/50 dark:hover:bg-gray-700/50 gap-3 rounded-2xl px-3 py-2",
                pathname === "/doc" &&
                  "bg-[#d3e2fd] dark:bg-gray-700 text-primary dark:text-blue-400 hover:bg-[#d3e2fd]/90 dark:hover:bg-gray-600"
              )}
            >
              <BookOpen className="h-5 w-4" />
              <span className="text-sm hidden md:inline">Documentation</span>
            </Link>
          </nav>

          {/* Settings section */}
          <div className="mt-auto pb-4">
            <button
              onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
              className="flex items-center text-muted-foreground hover:bg-white/50 dark:hover:bg-gray-700/50 w-full transition-colors gap-3 rounded-2xl px-3 py-2"
            >
              <Settings2 className="h-5 w-4" />
              <span className="text-sm hidden md:inline">Settings</span>
            </button>

            {/* Theme selector - only show when settings expanded */}
            {isSettingsExpanded && mounted && (
              <div className="mt-2 p-2 bg-white/30 dark:bg-gray-800/30 rounded-xl">
                <div className="text-sm font-medium text-muted-foreground mb-2 px-2">
                  Theme
                </div>
                <div className="grid gap-1">
                  <button
                    onClick={() => setTheme("light")}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg transition-colors",
                      theme === "light"
                        ? "bg-[#d3e2fd] dark:bg-gray-700 text-primary dark:text-blue-400"
                        : "hover:bg-white/50 dark:hover:bg-gray-700/50 text-muted-foreground"
                    )}
                  >
                    <Sun className="h-3 w-3" />
                    <span className="text-sm hidden md:inline">Light</span>
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg transition-colors",
                      theme === "dark"
                        ? "bg-[#d3e2fd] dark:bg-gray-700 text-primary dark:text-blue-400"
                        : "hover:bg-white/50 dark:hover:bg-gray-700/50 text-muted-foreground"
                    )}
                  >
                    <Moon className="h-3 w-3" />
                    <span className="text-sm hidden md:inline">Dark</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

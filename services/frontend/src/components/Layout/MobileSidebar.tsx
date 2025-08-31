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

import { startNewSession } from "@/lib/api";
import { cn } from "@/lib/utils";
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
import { useState } from "react";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const [isStartingNew, setIsStartingNew] = useState(false);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
  const { theme, setTheme } = useTheme();

  // Handler for new conversation button
  const handleNewConversation = () => {
    setIsStartingNew(true);
    try {
      // Clear the session ID to start a new session
      startNewSession();

      // Dispatch a custom event to notify other components
      window.dispatchEvent(new CustomEvent("newSessionStarted"));

      console.log("New session started from mobile sidebar");
      // Show success feedback for a moment
      setTimeout(() => setIsStartingNew(false), 1500);
    } catch (error) {
      console.error("Error starting new session:", error);
      setIsStartingNew(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden transition-opacity duration-300 ease-in-out"
        onClick={onClose}
      />

      {/* Mobile sidebar panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 z-50 sm:hidden rounded-t-3xl shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>

        {/* Mobile sidebar content */}
        <div className="px-6 pb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Menu
          </h2>

          {/* Navigation */}
          <nav className="space-y-2 mb-6">
            <button
              onClick={() => {
                handleNewConversation();
                onClose();
              }}
              disabled={isStartingNew}
              className={cn(
                "flex items-center w-full text-left p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                isStartingNew && "opacity-50 cursor-not-allowed"
              )}
            >
              <RefreshCw
                className={cn("h-5 w-5 mr-3", isStartingNew && "animate-spin")}
              />
              <span className="text-sm">
                {isStartingNew ? "Starting..." : "New Conversation"}
              </span>
            </button>

            <Link
              href="/"
              onClick={onClose}
              className="flex items-center w-full text-left p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <MessageSquare className="h-5 w-5 mr-3" />
              <span className="text-sm">Architecture Agent</span>
            </Link>

            <Link
              href="/doc"
              onClick={onClose}
              className="flex items-center w-full text-left p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <BookOpen className="h-5 w-5 mr-3" />
              <span className="text-sm">Documentation</span>
            </Link>
          </nav>

          {/* Settings section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <button
              onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
              className="flex items-center w-full text-left p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Settings2 className="h-5 w-5 mr-3" />
              <span className="text-sm">Settings</span>
            </button>

            {/* Theme selector */}
            {isSettingsExpanded && (
              <div className="mt-2 ml-8 space-y-2">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Theme
                </p>
                <button
                  onClick={() => {
                    setTheme("light");
                    onClose();
                  }}
                  className={cn(
                    "flex items-center w-full text-left p-2 rounded-lg transition-colors",
                    theme === "light"
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                >
                  <Sun className="h-4 w-4 mr-2" />
                  <span className="text-sm">Light</span>
                </button>
                <button
                  onClick={() => {
                    setTheme("dark");
                    onClose();
                  }}
                  className={cn(
                    "flex items-center w-full text-left p-2 rounded-lg transition-colors",
                    theme === "dark"
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                >
                  <Moon className="h-4 w-4 mr-2" />
                  <span className="text-sm">Dark</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

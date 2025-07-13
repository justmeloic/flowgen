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

import { BookOpen, MessageSquare, RotateCcw } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type * as React from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ className, isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);

  const handleRestart = async () => {
    setIsRestarting(true);
    try {
      const response = await fetch("http://localhost:8081/api/utils/restart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        console.log("Server restart initiated");
        // Show success feedback for a moment
        setTimeout(() => setIsRestarting(false), 2000);
      } else {
        console.error("Failed to restart server");
        setIsRestarting(false);
      }
    } catch (error) {
      console.error("Error restarting server:", error);
      setIsRestarting(false);
    }
  };

  const sidebarLinks = [
    {
      title: "CBA",
      icon: MessageSquare,
      variant: "default",
      href: "/",
    },
  ] as const;

  return (
    <div
      className={cn(
        "relative flex h-screen flex-col gap-4 px-3 pb-3 pt-16 transition-all duration-300 bg-[#f0f4f8] shadow-[2px_0_10px_0_rgba(0,0,0,0.1)] z-10 rounded-tr-xl rounded-br-xl border-r border-gray-200",
        isCollapsed && !isHovered ? "w-[80px]" : "w-[250px]",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <TooltipProvider>
        <Button
          variant="ghost"
          className={cn(
            "absolute top-4 p-2 hover:bg-white/50",
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

        {/* Documentation button at the top */}

        <div className="mt-16">
          <div
            className={cn(
              "mb-2 font-semibold text-gray-700 text-sm",
              isCollapsed && !isHovered ? "text-center" : ""
            )}
          >
            Docs
          </div>
          {isCollapsed && !isHovered ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href="/doc"
                  className={cn(
                    "flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-white/50",
                    pathname === "/doc" &&
                      "bg-[#d3e2fd] text-primary hover:bg-[#d3e2fd]/90"
                  )}
                >
                  <BookOpen className="h-5 w-5" />
                  <span className="sr-only">Documentation</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-4">
                Documentation
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link
              href="/doc"
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2 text-muted-foreground hover:bg-white/50",
                pathname === "/doc" &&
                  "bg-[#d3e2fd] text-primary hover:bg-[#d3e2fd]/90"
              )}
            >
              <BookOpen className="h-5 w-5" />
              Documentation
            </Link>
          )}
        </div>

        {/* **New Title Added Here** */}
        <div
          className={cn(
            "mb-2 mt-[240px] font-semibold text-gray-700 text-sm",
            isCollapsed && !isHovered ? "text-center" : ""
          )}
        >
          Agents
        </div>
        <nav className="grid gap-1">
          {sidebarLinks.map((link, index) => {
            const Icon = link.icon;
            return isCollapsed && !isHovered ? (
              <Tooltip key={index} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-white/50",
                      pathname === link.href &&
                        "bg-[#d3e2fd] text-primary hover:bg-[#d3e2fd]/90"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="sr-only">{link.title}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="flex items-center gap-4"
                >
                  {link.title}
                </TooltipContent>
              </Tooltip>
            ) : (
              <Link
                key={index}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2 text-muted-foreground hover:bg-white/50",
                  pathname === link.href &&
                    "bg-[#d3e2fd] text-primary hover:bg-[#d3e2fd]/90"
                )}
              >
                <Icon className="h-5 w-5" />
                {link.title}
              </Link>
            );
          })}
        </nav>

        {/* Restart Button at the bottom */}
        <div className="mt-auto mb-24">
          <div
            className={cn(
              "mb-2 font-semibold text-gray-700 text-sm",
              isCollapsed && !isHovered ? "text-center" : ""
            )}
          >
            Dev Tools
          </div>
          {isCollapsed && !isHovered ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRestart}
                  disabled={isRestarting}
                  className={cn(
                    "w-full flex items-center justify-center p-2 text-muted-foreground hover:text-white hover:bg-red-500/80  hover:border-red-400 rounded-3xl",
                    isRestarting && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <RotateCcw
                    className={cn("h-4 w-4", isRestarting && "animate-spin")}
                  />
                  <span className="sr-only">Restart Server</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-4">
                Restart Server
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRestart}
              disabled={isRestarting}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-white hover:bg-red-500/80  hover:border-red-400 rounded-3xl",
                isRestarting && "opacity-50 cursor-not-allowed"
              )}
            >
              <RotateCcw
                className={cn("h-4 w-4", isRestarting && "animate-spin")}
              />
              {isRestarting ? "Restarting..." : "Restart Server"}
            </Button>
          )}
        </div>
      </TooltipProvider>
    </div>
  );
}

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

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { submitBugReport } from "@/lib/api";
import { Diagram } from "@/types";
import { Bug, Send } from "lucide-react";
import { useState } from "react";

export interface BugReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentDiagram?: Diagram | null;
  chatHistory?: Array<{ role: string; content: string }>;
}

interface BugReportData {
  description: string;
  diagram?: Diagram;
  chatHistory?: Array<{ role: string; content: string }>;
  userAgent?: string;
  timestamp?: string;
  url?: string;
}

export function BugReportDialog({
  isOpen,
  onClose,
  currentDiagram,
  chatHistory = [],
}: BugReportDialogProps) {
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast({
        title: "Description required",
        description: "Please provide a description of the bug.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const bugReportData: BugReportData = {
        description: description.trim(),
        diagram: currentDiagram || undefined,
        chatHistory: chatHistory.slice(-10), // Include last 10 messages for context
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        url: window.location.href,
      };

      await submitBugReport(bugReportData);

      toast({
        title: "🙏 Thank you!",
        description:
          "Your bug report has been submitted successfully. We appreciate your help in improving the app!",
        duration: 5000,
        className:
          "bottom-0 right-0 fixed mb-4 mr-4 bg-green-50 dark:bg-green-900/80 border-green-200 dark:border-green-700 rounded-3xl shadow-[0_3px_3px_-1px_rgba(5,0.7,.7,0.4)] text-gray-700 dark:text-green-300",
      });

      setDescription("");
      onClose();
    } catch (error) {
      console.error("Failed to submit bug report:", error);
      toast({
        title: "Failed to submit report",
        description: "Please try again later or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setDescription("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] rounded-3xl bg-blue-50 dark:bg-secondary-dark border-none shadow-2xl">
        <DialogHeader className="space-y-4 pb-2">
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
              <Bug className="h-4 w-4 text-white" />
            </div>
            Report a Bug
          </DialogTitle>
          <DialogDescription className="text-muted-foreground leading-relaxed">
            If you see a client-side error, just copy-paste it and submit the
            bug.{" "}
            <span className="font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-lg">
              Your current diagram and recent conversation will be included
              automatically!
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-3">
            <label
              htmlFor="bug-description"
              className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300"
            >
              Describe the issue *
            </label>
            <Textarea
              id="bug-description"
              placeholder="Please describe what went wrong, what you expected to happen, and any steps to reproduce the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[140px] rounded-2xl border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800/50 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300 resize-none"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-3 p-4 bg-white/60 dark:bg-gray-800/30 rounded-2xl border border-gray-200/50 dark:border-gray-600/30">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Included context
            </h4>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-2 ml-4">
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                Browser and system information
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                Current page URL and timestamp
              </li>
              {currentDiagram && (
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                  Current diagram ({currentDiagram.diagram_type})
                </li>
              )}
              {chatHistory.length > 0 && (
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                  Recent conversation (last {Math.min(
                    chatHistory.length,
                    10
                  )}{" "}
                  messages)
                </li>
              )}
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-full px-6 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !description.trim()}
            className="gap-2 rounded-full px-6 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg transition-all duration-300"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

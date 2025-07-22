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

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reference } from "@/types";

interface ReferencesPanelProps {
  references: { [key: string]: Reference };
  isHidden: boolean;
  onToggleVisibility: () => void;
}

export function ReferencesPanel({
  references,
  isHidden,
  onToggleVisibility,
}: ReferencesPanelProps) {
  const referenceEntries = Object.entries(references);

  const handleViewDocument = (link: string) => {
    window.open(link, "_blank");
  };

  if (!referenceEntries.length) {
    return (
      <div className="p-4 text-center text-gray-500">
        No references available
      </div>
    );
  }

  return (
    <div className="h-full relative">
      {/* Hide button - only show when panel is visible */}
      {!isHidden && (
        <button
          onClick={onToggleVisibility}
          className="absolute  right-4 z-10 p-3 bg-blue-100 dark:bg-gray-700 rounded-full hover:bg-blue-200 dark:hover:bg-gray-600 transition-all duration-300 shadow-lg"
          aria-label="Hide references"
        >
          <svg
            className="w-5 h-5 text-gray-600 dark:text-gray-300"
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

      {/* Panel content */}
      <div>
        <h3 className="text-lg font-semibold mb-4 mt-4 text-center text-gray-500 dark:text-gray-300">
          References
        </h3>
        <Accordion type="single" collapsible className="w-full">
          {referenceEntries.map(([key, ref]) => (
            <AccordionItem
              key={ref.id}
              value={`item-${key}`}
              data-reference={key}
              className="relative"
            >
              <AccordionTrigger className="px-4 text-left">
                <span className="mr-2 flex-shrink-0">[{key}]</span>
                <span className="text-left break-words min-w-0">
                  {ref.title}
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4">
                <div className="flex justify-center w-full">
                  <button
                    onClick={() => handleViewDocument(ref.link)}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                      <polyline points="13 2 13 9 20 9"></polyline>
                    </svg>
                    View Document
                  </button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}

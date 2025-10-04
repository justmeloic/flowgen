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

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Skeleton } from "@/components/ui/skeleton"

interface SearchResultsProps {
  query: string
  isSearching: boolean
}

export function SearchResults({ query, isSearching }: SearchResultsProps) {
  // Mock data for demonstration
  const mockResults = [
    { id: 1, title: "Result 1", content: "Detailed content for Result 1" },
    { id: 2, title: "Result 2", content: "Detailed content for Result 2" },
    { id: 3, title: "Result 3", content: "Detailed content for Result 3" },
    { id: 4, title: "Result 4", content: "Detailed content for Result 4" },
    { id: 5, title: "Result 5", content: "Detailed content for Result 5" },
  ]

  if (isSearching) {
    return (
      <div className="mt-8 space-y-4">
        {[...Array(5)].map((_, index) => (
          <Skeleton key={index} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (!query) {
    return null
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Search Results for "{query}"</h3>
      <Accordion type="single" collapsible className="w-full">
        {mockResults.map((result) => (
          <AccordionItem key={result.id} value={`item-${result.id}`}>
            <AccordionTrigger>{result.title}</AccordionTrigger>
            <AccordionContent>{result.content}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}


import { SearchResultDocument } from "@/lib/api";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";

interface SearchResultsProps {
  query: string;
  isSearching: boolean;
  searchResults: SearchResultDocument[];
}

export function SearchResults({
  query,
  isSearching,
  searchResults,
}: SearchResultsProps) {
  // Log the raw search results for debugging
  console.log("Raw searchResults:", searchResults);

  if (isSearching) {
    return (
      <div className="mt-8 space-y-4">
        {[...Array(5)].map((_, index) => (
          <Skeleton key={index} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!query) {
    return null;
  }
  if (searchResults.length === 0) {
    return <p> </p>; // Use to be: No results found for "{query}".
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Search Results</h3>
      <Accordion type="single" collapsible className="w-full">
        {searchResults.map((result) => (
          <AccordionItem key={result.uri} value={result.uri}>
            <AccordionTrigger>{result.name}</AccordionTrigger>
            <AccordionContent>
              {/* update the snippets display logic*/}
              {result.snippets}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

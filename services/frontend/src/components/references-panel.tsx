import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface Reference {
  id: string;
  title: string;
  link: string;
}

interface ReferencesPanelProps {
  references: Reference[];
}

export function ReferencesPanel({ references }: ReferencesPanelProps) {
  if (!references.length) {
    return (
      <div className="p-4 text-center text-gray-500">
        No references available
      </div>
    );
  }

  return (
    <div className="h-full">
      <h3 className="text-lg font-semibold mb-4 mt-4 text-center text-gray-500 dark:text-gray-300">Search Results</h3>
      <Accordion type="single" collapsible className="w-full">
        {references.map((ref) => (
          <AccordionItem key={ref.id} value={`ref-${ref.id}`}>
            <AccordionTrigger className="px-4 text-center justify-center">{ref.title}</AccordionTrigger>
            <AccordionContent className="px-4">
              <button
                onClick={() => console.log(`Opening document: ${ref.link}`)}
                className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline"
              >
                <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                  <polyline points="13 2 13 9 20 9"></polyline>
                </svg>
                View Document
              </button>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
} 
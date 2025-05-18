import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface Reference {
  id: string;
  name: string;
  title: string;
  link: string;
}

interface ReferencesPanelProps {
  references: { [key: string]: Reference };
}

export function ReferencesPanel({ references }: ReferencesPanelProps) {
  const referenceEntries = Object.entries(references);

  const handleViewDocument = (link: string) => {
    // Convert GCS URL to actual viewable URL
    // Example: gs://cn-cba-usecase/cbas/1.1 Agreement.pdf -> https://storage.cloud.google.com/cn-cba-usecase/cbas/1.1%20Agreement.pdf
    const gsUrl = new URL(link);
    const bucket = gsUrl.host;
    // Get path without leading slash and handle encoding manually
    const path = gsUrl.pathname.substring(1)
      .split('/')
      .map(segment => segment.replace(/ /g, '%20'))
      .join('/');
    const publicUrl = `https://storage.cloud.google.com/${bucket}/${path}`;
    window.open(publicUrl, '_blank');
  };  

  if (!referenceEntries.length) {
    return (
      <div className="p-4 text-center text-gray-500">
        No references available
      </div>
    );
  }

  return (
    <div className="h-full">
      <h3 className="text-lg font-semibold mb-4 mt-4 text-center text-gray-500 dark:text-gray-300">References</h3>
      <Accordion type="single" collapsible className="w-full">
        {referenceEntries.map(([key, ref]) => (
          <AccordionItem key={ref.id} value={`ref-${key}`}>
            <AccordionTrigger className="px-4 text-left">
              <span className="mr-2">[{key}]</span>
              {ref.title}
            </AccordionTrigger>
            <AccordionContent className="px-4">
              <div className="flex justify-center w-full">
                <button
                  onClick={() => handleViewDocument(ref.link)}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline"
                >
                  <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
  );
} 
import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";

interface MermaidProps {
  chart: string;
}

const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "base",
    });

    if (mermaidRef.current && chart) {
      const element = mermaidRef.current;
      element.removeAttribute("data-processed");

      mermaid.run({ nodes: [element] });
      element.innerHTML = chart;
      mermaid.contentLoaded();
    }
  }, [chart]);

  return <div ref={mermaidRef} className="mermaid" />;
};

export default Mermaid;

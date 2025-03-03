import React, { createContext, useContext, useState } from "react";

export type Engine = "mermaid";

interface EngineContextType {
  selectedEngine: Engine;
  setSelectedEngine: (engine: Engine) => void;
}

const EngineContext = createContext<EngineContextType | undefined>(undefined);

export function EngineProvider({ children }: { children: React.ReactNode }) {
  const [selectedEngine, setSelectedEngine] = useState<Engine>("mermaid");

  return (
    <EngineContext.Provider value={{ selectedEngine, setSelectedEngine }}>
      {children}
    </EngineContext.Provider>
  );
}

export function useEngine() {
  const context = useContext(EngineContext);
  if (context === undefined) {
    throw new Error("useEngine must be used within an EngineProvider");
  }
  return context;
}

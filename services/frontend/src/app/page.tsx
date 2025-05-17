"use client";

import Link from "next/link";
import Image from "next/image";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <Shell>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold" id="top">
          CBA Agentic System
        </h1>
        <p className="text-lg text-gray-700">
          An agentic question answering system powered by AI for CBA analysis,
          built with Google Cloud Platform services.
        </p>

        {/* Add the centered architecture diagram */}
        <div className="flex justify-center my-8">
          <Image
            src="/architecture-diagram.png"
            alt="Architecture Diagram"
            width={1000}
            height={600}
            className="rounded-lg shadow-lg"
          />
        </div>

        <h2 className="text-2xl font-semibold mt-6" id="demo-applications">
          Demo Applications
        </h2>
        <div className="mt-4 flex space-x-4">
          {/* Use Shadcn UI Button component for consistent styling */}
          <Button
            asChild
            className="bg-primary text-white px-6 py-3 rounded-full hover:bg-primary/70 transition-colors"
          >
            <Link href="/chat">Try the Chat UI</Link>
          </Button>
        </div>
      </div>
    </Shell>
  );
}

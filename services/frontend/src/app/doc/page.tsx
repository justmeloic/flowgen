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

import { Shell } from "@/components/Layout/Shell";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import packageJson from "../../../package.json";

// Get version from package.json
const packageVersion = packageJson.version;

export default function HomePage() {
  return (
    <Shell>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 dark:text-gray-100" id="top">
            Flowgen
          </h1>
          <div className="flex justify-center items-center space-x-4 mb-6">
            <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              v{packageVersion}
            </span>
          </div>
          <div className="flex justify-center space-x-2 mb-6">
            <span className="inline-block bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40 text-blue-700 dark:text-blue-300 text-xs px-3 py-1 rounded-full border border-blue-200 dark:border-blue-700">
              Python 3.13+
            </span>
            <span className="inline-block bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/40 dark:to-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-xs px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-700">
              Next.js 14.0.0+
            </span>
            <span className="inline-block bg-gradient-to-r from-violet-50 to-violet-100 dark:from-violet-900/40 dark:to-violet-800/40 text-violet-700 dark:text-violet-300 text-xs px-3 py-1 rounded-full border border-violet-200 dark:border-violet-700">
              Google ADK 0.2.0+
            </span>
            <span className="inline-block bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/40 dark:to-indigo-800/40 text-indigo-700 dark:text-indigo-300 text-xs px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-700">
              FastAPI
            </span>
            <span className="inline-block bg-gradient-to-r from-pink-50 to-pink-100 dark:from-pink-900/40 dark:to-pink-800/40 text-pink-700 dark:text-pink-300 text-xs px-3 py-1 rounded-full border border-pink-200 dark:border-pink-700">
              Mermaid
            </span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
            Flowgen is an AI-powered architecture solution designer that helps
            you design comprehensive system architectures by gathering
            requirements, analyzing constraints, and generating detailed Mermaid
            diagrams. This interface allows users to interact with different AI
            agents powered by various models and equipped with specialized
            tools.
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            <strong>Author / Maintainer:</strong>{" "}
            <a
              href="https://github.com/justmeloic"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline transition-colors"
            >
              Loïc Muhirwa
            </a>
          </p>
        </div>

        {/* Architecture Diagram */}
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">
            High-level Architecture
          </h2>
          <div className="flex justify-center mb-6">
            <Image
              src="/architecture-diagram.png"
              alt="Agent Architecture"
              width={1000}
              height={600}
              className="rounded-2xl shadow-lg dark:shadow-gray-800"
            />
          </div>
        </div>
        {/* Component Usage */}
        <div>
          <h2 className="text-xl font-semibold mb-4 dark:text-gray-100 text-center">
            Technology Stack & Components
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
              <thead>
                <tr className="bg-gray-100 dark:bg-secondary-dark">
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left dark:text-gray-100">
                    Technology
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left dark:text-gray-100">
                    Component
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left dark:text-gray-100">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">
                    Next.js
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">
                    Frontend Framework
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">
                    React framework with SSR/SSG capabilities for optimal
                    performance
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">
                    FastAPI
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">
                    Backend Framework
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">
                    High-performance async API framework with automatic OpenAPI
                    documentation
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">
                    Google ADK
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">
                    Development Tool
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">
                    Agent Development Kit providing session management and
                    conversation continuity
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">
                    Mermaid.js
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">
                    Diagram Rendering
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">
                    Client-side rendering of architecture diagrams with
                    interactive features
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Architecture Design Capabilities */}
        <div>
          <h2 className="text-xl font-semibold mb-4 dark:text-gray-100 text-center">
            AI Architecture Design Capabilities
          </h2>
          <p className="text-xs text-gray-700 dark:text-gray-300 mb-6">
            Flowgen specializes in transforming high-level requirements into
            detailed system architectures through intelligent analysis and
            automated diagram generation.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gradient-to-br from-emerald-50/70 via-teal-50/50 to-cyan-50/70 dark:from-emerald-900/20 dark:via-teal-900/15 dark:to-cyan-900/20 p-6 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/50 shadow-sm backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-100 flex items-center">
                <span className="mr-2">🏗️</span>
                Requirement Analysis
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                Flowgen analyzes user requirements, identifies key components,
                and understands system constraints to create optimal
                architecture solutions.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  <span className="text-slate-700 dark:text-slate-300">
                    Functional requirement extraction
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  <span className="text-slate-700 dark:text-slate-300">
                    Non-functional constraint identification
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  <span className="text-slate-700 dark:text-slate-300">
                    Technology stack recommendations
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-violet-50/70 via-purple-50/50 to-fuchsia-50/70 dark:from-violet-900/20 dark:via-purple-900/15 dark:to-fuchsia-900/20 p-6 rounded-2xl border border-violet-200/50 dark:border-violet-700/50 shadow-sm backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-100 flex items-center">
                <span className="mr-2">📊</span>
                Mermaid Diagram Generation
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                Automatically generates professional Mermaid diagrams that
                visualize system architecture, data flows, and component
                relationships.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
                  <span className="text-slate-700 dark:text-slate-300">
                    System architecture diagrams
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
                  <span className="text-slate-700 dark:text-slate-300">
                    Data flow and sequence diagrams
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
                  <span className="text-slate-700 dark:text-slate-300">
                    Interactive diagram exploration
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Direct Editing Capabilities Section */}
          <div className="bg-gradient-to-br from-blue-50/70 via-cyan-50/50 to-teal-50/70 dark:from-blue-900/20 dark:via-cyan-900/15 dark:to-teal-900/20 p-6 rounded-2xl mb-6 border border-blue-200/50 dark:border-blue-700/50 shadow-sm backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-100 flex items-center">
              <span className="mr-2">✏️</span>
              Direct Diagram Editing
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              Flowgen offers powerful editing capabilities that work
              independently of the main conversation flow, allowing you to
              refine and modify diagrams directly.
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white/80 dark:bg-slate-700/50 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50 shadow-sm">
                <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2 flex items-center">
                  <span className="mr-2">👨‍💻</span>
                  Manual Code Editing
                </h4>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <li>
                    • Direct Mermaid code editing with syntax highlighting
                  </li>
                  <li>• Real-time diagram preview as you type</li>
                  <li>• Export diagrams as PNG images</li>
                  <li>• Copy Mermaid code to clipboard</li>
                </ul>
              </div>

              <div className="bg-white/80 dark:bg-slate-700/50 p-4 rounded-xl border border-cyan-100 dark:border-cyan-900/50 shadow-sm">
                <h4 className="font-semibold text-cyan-600 dark:text-cyan-400 mb-2 flex items-center">
                  <span className="mr-2">🤖</span>
                  AI-Powered Editing
                </h4>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <li>• Natural language editing instructions</li>
                  <li>• Independent backend editing service</li>
                  <li>• No need to go through main agent conversation</li>
                  <li>• Supports all Mermaid diagram types</li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-100/80 to-cyan-100/80 dark:from-blue-900/40 dark:to-cyan-900/40 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <strong>Pro Tip:</strong> Use the editing features to fine-tune
                diagrams generated by the AI agent, or create diagrams from
                scratch without starting a conversation.
              </p>
            </div>
          </div>
        </div>

        {/* Services */}
        <div>
          <h2 className="text-xl font-semibold mb-4 dark:text-gray-100 text-center">
            Services
          </h2>
          <p className=" text-center text-xs text-gray-700 dark:text-gray-300 mb-6">
            Flowgen is built with a modular architecture consisting of two main
            services that can be deployed independently or as a unified
            application.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-emerald-50/70 via-teal-50/50 to-cyan-50/70 dark:from-emerald-900/20 dark:via-teal-900/15 dark:to-cyan-900/20 p-6 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/50 shadow-sm backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-100 flex items-center">
                <span className="mr-2">🎨</span>
                Frontend Client
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                A Next.js web application that provides the user interface for
                interacting with AI agents across different models and
                capabilities.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  <span className="text-slate-700 dark:text-slate-300">
                    Modern React-based interface with TypeScript
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  <span className="text-slate-700 dark:text-slate-300">
                    Responsive design with dark/light mode
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  <span className="text-slate-700 dark:text-slate-300">
                    Real-time chat interface with model selector
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  <span className="text-slate-700 dark:text-slate-300">
                    Session management and conversation history
                  </span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-white/80 dark:bg-slate-700/50 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                <code className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                  Tech Stack: Next.js 14+
                </code>
              </div>
            </div>
            <div className="bg-gradient-to-br from-violet-50/70 via-purple-50/50 to-fuchsia-50/70 dark:from-violet-900/20 dark:via-purple-900/15 dark:to-fuchsia-900/20 p-6 rounded-2xl border border-violet-200/50 dark:border-violet-700/50 shadow-sm backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-100 flex items-center">
                <span className="mr-2">🤖</span>
                Agent Orchestration API
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                The backend service that coordinates AI agents using Google ADK
                for sophisticated multi-model conversations and tool
                integration.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
                  <span className="text-slate-700 dark:text-slate-300">
                    Multi-model AI interactions (Gemini 2.5 Flash/Pro)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
                  <span className="text-slate-700 dark:text-slate-300">
                    Agent selection and intelligent routing
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
                  <span className="text-slate-700 dark:text-slate-300">
                    Tool integration and execution (Google Search)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
                  <span className="text-slate-700 dark:text-slate-300">
                    Response generation and formatting
                  </span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-white/80 dark:bg-slate-700/50 rounded-lg border border-violet-100 dark:border-violet-900/30">
                <code className="text-xs text-violet-700 dark:text-violet-300 font-medium">
                  Tech Stack: FastAPI, Google ADK
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Try Flowgen */}
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4 dark:text-gray-100 text-center">
            Try Flowgen Architecture Design Agent
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Start designing your system architecture with AI-powered analysis
            and automated Mermaid diagram generation.
          </p>
          <Button
            asChild
            className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white px-8 py-3 rounded-full transition-all duration-200 text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Link href="/">Design Architecture</Link>
          </Button>
        </div>

        {/* License */}
        <div className="text-center pt-8 border-t dark:border-gray-600">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            This project is licensed under the Apache License, Version 2.0
          </p>
        </div>
      </div>
    </Shell>
  );
}

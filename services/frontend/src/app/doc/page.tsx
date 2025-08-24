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
 * distributed under the License is distributed on an "A              <p className="text-xs text-gray-700 dark:text-gray-300 mb-4">
                The Next.js frontend and FastAPI backend are deployed and
                managed as separate, independent services.
              </p>
              <div className="bg-gray-800 text-green-400 p-3 rounded-2xl text-xs font-mono">
                <div>cd services/frontend/</div>
                <div>npm run dev</div>
                <div className="mt-2">cd services/backend/src/</div>
                <div>uv run app.py</div>
              </div>S,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use client";

import { Shell } from "@/components/shell";
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
            Flowgen - AI Architecture Designer
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

        {/* AI Architecture Design Capabilities */}
        <div>
          <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">
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

          <div className="bg-gradient-to-br from-blue-50/60 via-indigo-50/40 to-purple-50/60 dark:from-blue-900/25 dark:via-indigo-900/20 dark:to-purple-900/25 p-6 rounded-2xl mb-6 border border-blue-200/50 dark:border-blue-700/50 shadow-sm backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-100 flex items-center">
              <span className="mr-2">🎯</span>
              Supported Architecture Patterns
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white/80 dark:bg-slate-700/50 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50 shadow-sm">
                <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
                  🏢 Enterprise Systems
                </h4>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <li>• Microservices architecture</li>
                  <li>• Service-oriented architecture</li>
                  <li>• Event-driven systems</li>
                  <li>• API gateway patterns</li>
                </ul>
              </div>
              <div className="bg-white/80 dark:bg-slate-700/50 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
                <h4 className="font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                  ☁️ Cloud Native
                </h4>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <li>• Container orchestration</li>
                  <li>• Serverless architectures</li>
                  <li>• Multi-cloud strategies</li>
                  <li>• CI/CD pipelines</li>
                </ul>
              </div>
              <div className="bg-white/80 dark:bg-slate-700/50 p-4 rounded-xl border border-purple-100 dark:border-purple-900/50 shadow-sm">
                <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">
                  📱 Modern Applications
                </h4>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <li>• Web application architectures</li>
                  <li>• Mobile backend systems</li>
                  <li>• Real-time communication</li>
                  <li>• Data processing pipelines</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Model Conversation Continuity */}
        <div>
          <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">
            Multi-Model Conversation Continuity
          </h2>
          <p className="text-xs text-gray-700 dark:text-gray-300 mb-6">
            One of the most sophisticated features of this system is{" "}
            <strong>seamless model switching mid-conversation</strong>. Users
            can switch between different AI models (e.g., Gemini 2.5 Flash ↔
            Gemini 2.5 Pro) while maintaining complete conversation history and
            context.
          </p>

          <div className="bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50 dark:from-slate-800/50 dark:via-slate-800/30 dark:to-slate-700/50 p-6 rounded-2xl mb-6 border border-blue-100 dark:border-slate-600 backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-100">
              How It Works
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              Our architecture leverages Google ADK's session management to
              provide true conversation continuity across different models:
            </p>

            <div className="grid md:grid-cols-3 gap-4 text-xs">
              <div className="bg-white/80 dark:bg-slate-700/50 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/50 shadow-sm">
                <h4 className="font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
                  🏭 Agent Factory Pattern
                </h4>
                <p className="text-slate-600 dark:text-slate-300">
                  Creates and caches model-specific agents with LRU caching for
                  optimal performance.
                </p>
              </div>
              <div className="bg-white/80 dark:bg-slate-700/50 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50 shadow-sm">
                <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
                  🏃‍♂️ Runner Management
                </h4>
                <p className="text-slate-600 dark:text-slate-300">
                  Model-specific runners that share the same session service for
                  memory continuity.
                </p>
              </div>
              <div className="bg-white/80 dark:bg-slate-700/50 p-4 rounded-xl border border-violet-100 dark:border-violet-900/50 shadow-sm">
                <h4 className="font-semibold text-violet-600 dark:text-violet-400 mb-2">
                  🧠 Shared Session Service
                </h4>
                <p className="text-slate-600 dark:text-slate-300">
                  Single session ID across all models with automatic history
                  loading.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-slate-800 dark:via-slate-800 dark:to-slate-700 p-6 rounded-2xl border border-slate-200 dark:border-slate-600">
            <h3 className="text-base font-semibold mb-3 text-slate-800 dark:text-slate-100">
              Key Benefits
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-500">✅</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    <strong>True Conversation Continuity:</strong> Switch models
                    without losing context
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-500">✅</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    <strong>Performance Optimization:</strong> Cached runners
                    and agents for fast switching
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-500">✅</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    <strong>Model-Specific Capabilities:</strong> Each model
                    maintains its unique characteristics
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-500">✅</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    <strong>Unified Memory:</strong> Shared session service
                    ensures consistent experience
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services */}
        <div>
          <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">
            Services
          </h2>
          <p className="text-xs text-gray-700 dark:text-gray-300 mb-6">
            Agent Interface is built with a modular architecture consisting of
            two main services that can be deployed independently or as a unified
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

        {/* Typography & Design System */}
        <div>
          <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">
            Typography & Design System
          </h2>
          <p className="text-xs text-gray-700 dark:text-gray-300 mb-6">
            Flowgen uses a carefully selected typography system combining Google
            Fonts for optimal readability and brand consistency across different
            interface elements.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-50/70 via-indigo-50/50 to-purple-50/70 dark:from-blue-900/20 dark:via-indigo-900/15 dark:to-purple-900/20 p-6 rounded-2xl border border-blue-200/50 dark:border-blue-700/50 shadow-sm backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-100 flex items-center">
                <span className="mr-2 font-sans">Aa</span>
                Inter (Primary)
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                The main system font used for body text, buttons, and interface
                elements. Provides excellent readability and professional
                appearance.
              </p>
              <div className="bg-white/80 dark:bg-slate-700/50 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
                <code className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                  font-sans, --font-sans
                </code>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50/70 via-teal-50/50 to-cyan-50/70 dark:from-emerald-900/20 dark:via-teal-900/15 dark:to-cyan-900/20 p-6 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/50 shadow-sm backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-100 flex items-center">
                <span className="mr-2 font-poppins">Aa</span>
                Poppins (Subtitle)
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                Used for subtitle text and descriptive content. Clean, modern,
                and highly readable for longer text passages.
              </p>
              <div className="bg-white/80 dark:bg-slate-700/50 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                <code className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                  font-poppins, --font-poppins
                </code>
              </div>
            </div>

            <div className="bg-gradient-to-br from-violet-50/70 via-purple-50/50 to-fuchsia-50/70 dark:from-violet-900/20 dark:via-purple-900/15 dark:to-fuchsia-900/20 p-6 rounded-2xl border border-violet-200/50 dark:border-violet-700/50 shadow-sm backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-100 flex items-center">
                <span className="mr-2 font-cursive">Aa</span>
                Dancing Script (Accent)
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                Reserved for special headings and branding elements. Adds
                personality and warmth to the interface.
              </p>
              <div className="bg-white/80 dark:bg-slate-700/50 p-3 rounded-lg border border-violet-100 dark:border-violet-900/30">
                <code className="text-xs text-violet-700 dark:text-violet-300 font-medium">
                  font-cursive, --font-cursive
                </code>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-50/70 via-yellow-50/50 to-orange-50/70 dark:from-amber-900/30 dark:via-yellow-900/25 dark:to-orange-900/30 border-l-4 border-amber-400 dark:border-amber-500 p-4 rounded-r-xl shadow-sm">
            <h4 className="text-base font-semibold text-amber-800 dark:text-amber-200 mb-2">
              🎨 Font Weight & Loading Strategy
            </h4>
            <p className="text-sm text-amber-700 dark:text-amber-200 mb-2">
              All fonts are loaded with optimized weight ranges to balance
              visual hierarchy with performance. The fonts are preloaded using
              Next.js font optimization for fast rendering.
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-xs text-amber-700 dark:text-amber-200">
              <div className="space-y-1">
                <div>
                  <strong>Inter:</strong> Sans-serif, variable font
                </div>
                <div>
                  <strong>Poppins:</strong> 300, 400, 500, 600 weights
                </div>
              </div>
              <div className="space-y-1">
                <div>
                  <strong>Dancing Script:</strong> 400, 500, 600, 700 weights
                </div>
                <div>
                  <strong>Loading:</strong> Automatic font display swap
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Component Usage */}
        <div>
          <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">
            Technology Stack & Components
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
              <thead>
                <tr className="bg-gray-100 dark:bg-secondary-dark">
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left dark:text-gray-100">
                    Component
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left dark:text-gray-100">
                    Type
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
                    Google Fonts
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">
                    Typography System
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">
                    Inter (primary), Poppins (subtitles), Dancing Script
                    (accents) for optimal readability
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

        {/* Deployment Models */}
        <div>
          <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">
            Deployment Architecture
          </h2>
          <div className="bg-gradient-to-br from-blue-50/60 via-indigo-50/40 to-purple-50/60 dark:from-blue-900/25 dark:via-indigo-900/20 dark:to-purple-900/25 p-6 rounded-2xl mb-6 border border-blue-200/50 dark:border-blue-700/50 shadow-sm backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-100 flex items-center">
              <span className="mr-2">🚀</span>
              Production Optimized
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              This project uses a streamlined single-service architecture that
              maximizes performance and minimizes resource usage for production
              deployment.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50/60 via-sky-50/40 to-cyan-50/60 dark:from-blue-900/25 dark:via-sky-900/20 dark:to-cyan-900/25 p-6 rounded-2xl border border-blue-200/50 dark:border-blue-700/50 shadow-sm backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-100">
                Development Mode (Two Services)
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                During development, run frontend and backend as separate
                services over the network for faster iteration and
                hot-reloading.
              </p>
              <div className="bg-slate-800 dark:bg-slate-900 text-emerald-400 p-4 rounded-xl text-xs font-mono border border-slate-700">
                <div># Frontend (port 3000)</div>
                <div>cd services/frontend/</div>
                <div>npm run dev</div>
                <div className="mt-2"># Backend (port 8081)</div>
                <div>cd services/backend/</div>
                <div>uvicorn src.app.main:app --host 0.0.0.0 --port 8081</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50/60 via-green-50/40 to-teal-50/60 dark:from-emerald-900/25 dark:via-green-900/20 dark:to-teal-900/25 p-6 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/50 shadow-sm backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-100">
                Production Mode (Single Service)
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                For production deployment, the FastAPI backend serves
                pre-rendered static frontend files, creating a unified,
                resource-efficient service.
              </p>
              <div className="bg-slate-800 dark:bg-slate-900 text-emerald-400 p-4 rounded-xl text-xs font-mono border border-slate-700">
                <div># Build and deploy</div>
                <div>source scripts/build.sh</div>
                <div>source scripts/deploy.sh</div>
                <div className="mt-2"># Single service on port 8081</div>
                <div># Serves both static frontend + API</div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-gradient-to-r from-amber-50/70 via-yellow-50/50 to-orange-50/70 dark:from-amber-900/30 dark:via-yellow-900/25 dark:to-orange-900/30 border-l-4 border-amber-400 dark:border-amber-500 p-4 rounded-r-xl shadow-sm">
            <h4 className="text-base font-semibold text-amber-800 dark:text-amber-200 mb-2">
              🏗️ Why This Architecture?
            </h4>
            <div className="grid md:grid-cols-2 gap-4 text-xs text-amber-700 dark:text-amber-200">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-500">⚡</span>
                  <span>
                    <strong>Resource Efficiency:</strong> Single process uses
                    less RAM and CPU
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-500">🔧</span>
                  <span>
                    <strong>Simplified Management:</strong> One service to
                    monitor and restart
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-500">🌐</span>
                  <span>
                    <strong>Network Simplicity:</strong> Only port 8081 to
                    expose
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-500">🚀</span>
                  <span>
                    <strong>Fast Startup:</strong> Quick boot times on Pi
                    hardware
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Session Management */}
        <div>
          <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">
            Session Management & Memory Architecture
          </h2>
          <p className="text-xs text-gray-700 dark:text-gray-300 mb-6">
            The system uses sophisticated session management to maintain
            conversation continuity and context preservation across multiple
            interactions and model switches.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-700">
              <h3 className="text-base font-semibold mb-3 dark:text-gray-100 flex items-center">
                <span className="mr-2">🔄</span>
                Session Flow
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    1
                  </span>
                  <div>
                    <strong className="text-blue-700 dark:text-blue-300">
                      Initial Request:
                    </strong>
                    <p className="text-gray-600 dark:text-gray-400">
                      Backend generates new UUID, creates session, returns
                      session ID in X-Session-ID header
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    2
                  </span>
                  <div>
                    <strong className="text-blue-700 dark:text-blue-300">
                      Subsequent Requests:
                    </strong>
                    <p className="text-gray-600 dark:text-gray-400">
                      Frontend includes X-Session-ID header, backend validates
                      and uses existing session
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    3
                  </span>
                  <div>
                    <strong className="text-blue-700 dark:text-blue-300">
                      Session State:
                    </strong>
                    <p className="text-gray-600 dark:text-gray-400">
                      Backend maintains session state using ADK's
                      InMemorySessionService
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-700">
              <h3 className="text-base font-semibold mb-3 dark:text-gray-100 flex items-center">
                <span className="mr-2">🧠</span>
                Memory Continuity
              </h3>
              <div className="space-y-3 text-xs">
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                  <strong className="text-purple-700 dark:text-purple-300">
                    Same Session Service:
                  </strong>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    All runners share the same InMemorySessionService instance
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                  <strong className="text-purple-700 dark:text-purple-300">
                    Automatic Context Loading:
                  </strong>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    ADK automatically provides full conversation history to new
                    models
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                  <strong className="text-purple-700 dark:text-purple-300">
                    Cross-Model Memory:
                  </strong>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Switching models preserves complete conversation context
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-50/70 via-yellow-50/50 to-orange-50/70 dark:from-amber-900/30 dark:via-yellow-900/25 dark:to-orange-900/30 border-l-4 border-amber-400 dark:border-amber-500 p-4 rounded-r-xl shadow-sm">
            <div className="flex items-start">
              <div className="ml-3">
                <h4 className="text-base font-semibold text-amber-800 dark:text-amber-200 mb-2">
                  🔬 Shared Memory Pattern
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-200 mb-2">
                  The session architecture enables a pattern where each AI model
                  gets its own isolated runner, but they all share the same
                  conversation memory through the ADK session service. This
                  means when you switch from Gemini 2.5 Flash to Gemini 2.5 Pro
                  mid-conversation, the Pro model automatically receives the
                  complete conversation history and remembers everything from
                  the Flash model's interactions.
                </p>
                <code className="text-xs bg-amber-100 dark:bg-amber-800 text-amber-800 dark:text-amber-200 px-2 py-1 rounded font-mono">
                  session_service=request.app.state.session_service # 🔑 THE
                  MAGIC
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Try Flowgen */}
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">
            Try Flowgen Architecture Designer
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

        {/* Repository Structure */}
        <div>
          <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">
            Repository Structure
          </h2>
          <div className="bg-slate-800 dark:bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-xs border border-slate-600 shadow-sm">
            <div>.</div>
            <div>├── docs</div>
            <div>├── scripts</div>
            <div>│ └── deploy.sh</div>
            <div>└── services</div>
            <div> ├── backend</div>
            <div> │ ├── pyproject.toml</div>
            <div> │ ├── src</div>
            <div> │ ├── static_frontend</div>
            <div> │ ├── tests</div>
            <div> │ └── uv.lock</div>
            <div> └── frontend</div>
            <div> ├── components.json</div>
            <div> ├── next.config.mjs</div>
            <div> ├── package.json</div>
            <div> ├── public</div>
            <div> ├── src</div>
            <div> ├── tailwind.config.js</div>
            <div> └── tsconfig.json</div>
          </div>
        </div>

        {/* Build & Deploy Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">
            Build & Deploy
          </h2>
          <div className="bg-red-50 dark:bg-red-900/30 p-6 rounded-2xl mb-6 border border-red-200 dark:border-red-700">
            <h3 className="text-base font-semibold mb-2 dark:text-gray-100 flex items-center">
              <span className="mr-2">🎯</span>
              Production Deployment Strategy
            </h3>
            <p className="text-xs text-gray-700 dark:text-gray-300 mb-2">
              The system uses a streamlined deployment approach. The Next.js
              frontend is pre-rendered into static HTML, CSS, and JS files, then
              served by the FastAPI backend as a single unified service. This
              reduces resource usage and simplifies management.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">
                  Development Benefits
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Two-service mode with hot reload for fast iteration during
                  development
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">
                  Production Benefits
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Single-service mode optimized for constrained environments
                </p>
              </div>
            </div>
          </div>
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

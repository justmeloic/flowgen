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
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use client";

import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <Shell>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 dark:text-gray-100" id="top">
            AgentChat - Multi-Model AI Agent Chat Interface
          </h1>
          <div className="flex justify-center space-x-2 mb-6">
            <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm px-3 py-1 rounded-full">
              Python 3.13+
            </span>
            <span className="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm px-3 py-1 rounded-full">
              Next.js 14.0.0+
            </span>
            <span className="inline-block bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-sm px-3 py-1 rounded-full">
              Google ADK 0.2.0+
            </span>
            <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm px-3 py-1 rounded-full">
              Google Cloud
            </span>
            <span className="inline-block bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-sm px-3 py-1 rounded-full">
              Apache 2.0
            </span>
          </div>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
            A versatile chat interface that allows users to interact with
            different AI agents powered by various models and equipped with
            specialized tools.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
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
          <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">
            System Architecture
          </h2>
          <div className="flex justify-center mb-6">
            <Image
              src="/architecture-diagram.png"
              alt="AgentChat Architecture"
              width={1000}
              height={600}
              className="rounded-2xl shadow-lg dark:shadow-gray-800"
            />
          </div>
        </div>

        {/* Multi-Model Conversation Continuity */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">
            Multi-Model Conversation Continuity
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            One of the most sophisticated features of this system is{" "}
            <strong>seamless model switching mid-conversation</strong>. Users
            can switch between different AI models (e.g., Gemini 2.5 Flash ↔
            Gemini 2.5 Pro) while maintaining complete conversation history and
            context.
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-2xl mb-6">
            <h3 className="text-xl font-semibold mb-3 dark:text-gray-100">
              How It Works
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Our architecture leverages Google ADK's session management to
              provide true conversation continuity across different models:
            </p>

            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">
                  🏭 Agent Factory Pattern
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Creates and caches model-specific agents with LRU caching for
                  optimal performance.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
                  🏃‍♂️ Runner Management
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Model-specific runners that share the same session service for
                  memory continuity.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">
                  🧠 Shared Session Service
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Single session ID across all models with automatic history
                  loading.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-secondary-dark p-6 rounded-2xl">
            <h3 className="text-lg font-semibold mb-3 dark:text-gray-100">
              Key Benefits
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span className="dark:text-gray-300">
                    <strong>True Conversation Continuity:</strong> Switch models
                    without losing context
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span className="dark:text-gray-300">
                    <strong>Performance Optimization:</strong> Cached runners
                    and agents for fast switching
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span className="dark:text-gray-300">
                    <strong>Model-Specific Capabilities:</strong> Each model
                    maintains its unique characteristics
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span className="dark:text-gray-300">
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
          <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">
            Services
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            AgentChat is built with a modular architecture consisting of two
            main services that can be deployed independently or as a unified
            application.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-2xl border border-green-200 dark:border-green-700">
              <h3 className="text-xl font-semibold mb-3 dark:text-gray-100 flex items-center">
                <span className="mr-2">🎨</span>
                Frontend Client
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                A Next.js web application that provides the user interface for
                interacting with AI agents across different models and
                capabilities.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="dark:text-gray-300">
                    Modern React-based interface with TypeScript
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="dark:text-gray-300">
                    Responsive design with dark/light mode
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="dark:text-gray-300">
                    Real-time chat interface with model selector
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="dark:text-gray-300">
                    Session management and conversation history
                  </span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
                <code className="text-sm text-gray-700 dark:text-gray-300">
                  Tech Stack: Next.js 14+, React 18+, TypeScript, Tailwind CSS
                </code>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-700">
              <h3 className="text-xl font-semibold mb-3 dark:text-gray-100 flex items-center">
                <span className="mr-2">🤖</span>
                Agent Orchestration API
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                The backend service that coordinates AI agents using Google ADK
                for sophisticated multi-model conversations and tool
                integration.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span className="dark:text-gray-300">
                    Multi-model AI interactions (Gemini 2.5 Flash/Pro)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span className="dark:text-gray-300">
                    Agent selection and intelligent routing
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span className="dark:text-gray-300">
                    Tool integration and execution (Google Search)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span className="dark:text-gray-300">
                    Response generation and formatting
                  </span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
                <code className="text-sm text-gray-700 dark:text-gray-300">
                  Tech Stack: FastAPI, Python 3.13+, Google ADK, Vertex AI
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Component Usage */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">
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
                    Vertex AI
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">
                    GCP
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">
                    Multi-model AI service powering Gemini 2.5 Flash and Pro
                    agents
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
                    GCS Bucket
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">
                    GCP
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">
                    Storage for build artifacts, deployment packages, and backup
                    storage
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">
                    Cloud Logging
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">
                    GCP
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">
                    Monitors application performance and tracks agent
                    interactions
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">
                    Cloud Run
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">
                    GCP
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">
                    Hosts containerized services for web interfaces and APIs
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
              </tbody>
            </table>
          </div>
        </div>

        {/* Deployment Models */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">
            Deployment Models
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            This project supports two primary deployment models, offering
            flexibility based on your operational needs, team structure, and
            scaling requirements.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-2xl">
              <h3 className="text-xl font-semibold mb-3 dark:text-gray-100">
                1. Independent Services (Microservice-Style)
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                The Next.js frontend and FastAPI backend are deployed and
                managed as separate, independent services.
              </p>
              <div className="bg-gray-800 text-green-400 p-3 rounded-2xl text-sm font-mono">
                <div>cd services/frontend/</div>
                <div>npm run dev</div>
                <div className="mt-2">cd services/backend/src/</div>
                <div>uv run app.py</div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/30 p-6 rounded-2xl">
              <h3 className="text-xl font-semibold mb-3 dark:text-gray-100">
                2. Modular Monolith (Combined Deployment)
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                The FastAPI backend serves static assets from the Next.js
                frontend, creating a single deployable unit.
              </p>
              <div className="bg-gray-800 text-green-400 p-3 rounded-2xl text-sm font-mono">
                <div>cd services/frontend/</div>
                <div>npm run build-local</div>
                <div className="mt-2">cd ../backend/src/</div>
                <div>uv run app.py</div>
              </div>
            </div>
          </div>
        </div>

        {/* Authentication */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">
            Authentication
          </h2>
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700 dark:text-yellow-200">
                  <strong>
                    ⚠️ This is a simple authentication system suitable for a
                    proof-of-concept and should not be used in production!
                  </strong>
                </p>
              </div>
            </div>
          </div>

          <p className="text-gray-700 dark:text-gray-300 mb-4">
            A simple header-based authentication system that provides basic
            access control using a secret code validated on the server.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 dark:text-gray-100">
                How it Works
              </h3>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                <li>
                  1. Users are redirected to{" "}
                  <code className="bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-1 rounded-2xl">
                    /login
                  </code>{" "}
                  when accessing protected pages.
                </li>
                <li>2. Must enter the correct access code to gain access.</li>
                <li>
                  3. The frontend sends the secret to the backend for
                  validation.
                </li>
                <li>
                  4. The backend creates an authenticated session and returns a
                  session ID.
                </li>
                <li>
                  5. The frontend stores the session ID and sends it in the
                  header of subsequent requests.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 dark:text-gray-100">
                Configuration
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                The secret is configured in the backend's `.env` file:
              </p>
              <pre className="bg-gray-800 text-white p-4 rounded-md overflow-x-auto">
                <div>AUTH_SECRET=your-super-secret-key</div>
              </pre>
            </div>
          </div>
        </div>

        {/* Session Management */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">
            Session Management & Memory Architecture
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            The system uses sophisticated session management to maintain
            conversation continuity and context preservation across multiple
            interactions and model switches.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-700">
              <h3 className="text-lg font-semibold mb-3 dark:text-gray-100 flex items-center">
                <span className="mr-2">🔄</span>
                Session Flow
              </h3>
              <div className="space-y-3 text-sm">
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
              <h3 className="text-lg font-semibold mb-3 dark:text-gray-100 flex items-center">
                <span className="mr-2">🧠</span>
                Memory Continuity
              </h3>
              <div className="space-y-3 text-sm">
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

          <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4">
            <div className="flex items-start">
              <div className="ml-3">
                <h4 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  🔬 Advanced Engineering Pattern
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-200 mb-2">
                  The session architecture enables a sophisticated pattern where
                  each AI model gets its own isolated runner, but they all share
                  the same conversation memory through the ADK session service.
                  This means when you switch from Gemini 2.5 Flash to Gemini 2.5
                  Pro mid-conversation, the Pro model automatically receives the
                  complete conversation history and remembers everything from
                  the Flash model's interactions.
                </p>
                <code className="text-xs bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                  session_service=request.app.state.session_service # 🔑 THE
                  MAGIC
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Try the Agent */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">
            Try AgentChat
          </h2>
          <Button
            asChild
            className="bg-primary text-white px-8 py-3 rounded-full hover:bg-primary/70 transition-colors text-lg"
          >
            <Link href="/">Start Chat with AgentChat</Link>
          </Button>
        </div>

        {/* Repository Structure */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">
            Repository Structure
          </h2>
          <div className="bg-gray-800 text-green-400 p-4 rounded-2xl font-mono text-sm">
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
          <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">
            Build & Deploy
          </h2>
          <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-2xl mb-6">
            <h3 className="text-lg font-semibold mb-2 dark:text-gray-100">
              Single Service, Static Frontend
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              The frontend is pre-rendered into static HTML, CSS, and JS files
              using Next.js. These static files are then mounted and served by
              the FastAPI backend, so you only need to deploy one service. This
              approach improves performance, simplifies deployment, and reduces
              operational complexity.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              <strong>Why GCS?</strong> The build is zipped and uploaded to a
              Google Cloud Storage bucket because the deployment host server may
              not have internet access to clone or pull the repository. Using
              GCS allows you to reliably transfer the build artifact to
              air-gapped or restricted environments.
            </p>
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 dark:text-gray-100">
              Automated Build & Upload
            </h3>
            <div className="bg-gray-800 text-green-400 p-3 rounded-2xl text-sm font-mono mb-2">
              <div># From project root</div>
              <div>source scripts/build.sh</div>
            </div>
            <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc pl-5 mb-2">
              <li>
                Builds frontend static files and copies them to the backend
              </li>
              <li>
                Creates a zip archive of the backend (with static frontend)
              </li>
              <li>Uploads the archive to a GCS bucket</li>
            </ul>
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 dark:text-gray-100">
              Automated Deployment
            </h3>
            <div className="bg-gray-800 text-green-400 p-3 rounded-2xl text-sm font-mono mb-2">
              <div># On the deployment server</div>
              <div>source scripts/deploy-vm.sh</div>
            </div>
            <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc pl-5 mb-2">
              <li>Downloads the latest build from GCS</li>
              <li>Extracts and sets up the environment</li>
              <li>Kills any process using port 8000 or running uvicorn</li>
              <li>Starts the FastAPI server in a screen session</li>
            </ul>
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 dark:text-gray-100">
              Deployment Pipeline
            </h3>
            <div className="overflow-x-auto">
              <pre className="bg-gray-100 dark:bg-gray-800 dark:text-gray-300 p-3 rounded text-xs font-mono whitespace-pre">
                {`Build Process:           Deploy Process:
[Frontend Build]          [Download from GCS]
      ↓                         ↓
[Static Files]            [Extract Archive]
      ↓                         ↓
[Zip Archive]             [Setup Environment]
      ↓                         ↓
[Upload to GCS]           [Start Server]
`}
              </pre>
            </div>
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 dark:text-gray-100">
              Server Management
            </h3>
            <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc pl-5 mb-2">
              <li>
                Attach to server:{" "}
                <code className="bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-1 rounded-2xl">
                  screen -r backend
                </code>
              </li>
              <li>
                Detach:{" "}
                <span className="bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-1 rounded-2xl">
                  Ctrl+A, then D
                </span>
              </li>
              <li>
                List sessions:{" "}
                <code className="bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-1 rounded-2xl">
                  screen -list
                </code>
              </li>
              <li>
                Kill session:{" "}
                <code className="bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-1 rounded-2xl">
                  screen -S backend -X quit
                </code>
              </li>
            </ul>
          </div>
        </div>

        {/* License */}
        <div className="text-center pt-8 border-t dark:border-gray-600">
          <p className="text-gray-600 dark:text-gray-400">
            This project is licensed under the Apache License, Version 2.0
          </p>
        </div>
      </div>
    </Shell>
  );
}

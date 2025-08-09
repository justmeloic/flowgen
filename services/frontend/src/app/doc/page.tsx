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
            Agent Interface
          </h1>
          <div className="flex justify-center items-center space-x-4 mb-6">
            <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              v{packageVersion}
            </span>
          </div>
          <div className="flex justify-center space-x-2 mb-6">
            <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-3 py-1 rounded-full">
              Python 3.13+
            </span>
            <span className="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-3 py-1 rounded-full">
              Next.js 14.0.0+
            </span>
            <span className="inline-block bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs px-3 py-1 rounded-full">
              Google ADK 0.2.0+
            </span>
            <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-3 py-1 rounded-full">
              FastAPI
            </span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
            A versatile chat interface that allows users to interact with
            different AI agents powered by various models and equipped with
            specialized tools. Optimized for Raspberry Pi 5 🍓.
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
              alt="AgentChat Architecture"
              width={1000}
              height={600}
              className="rounded-2xl shadow-lg dark:shadow-gray-800"
            />
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

          <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-2xl mb-6">
            <h3 className="text-lg font-semibold mb-3 dark:text-gray-100">
              How It Works
            </h3>
            <p className="text-xs text-gray-700 dark:text-gray-300 mb-4">
              Our architecture leverages Google ADK's session management to
              provide true conversation continuity across different models:
            </p>

            <div className="grid md:grid-cols-3 gap-4 text-xs">
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
            <h3 className="text-base font-semibold mb-3 dark:text-gray-100">
              Key Benefits
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-xs">
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
          <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">
            Services
          </h2>
          <p className="text-xs text-gray-700 dark:text-gray-300 mb-6">
            AgentChat is built with a modular architecture consisting of two
            main services that can be deployed independently or as a unified
            application.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-2xl border border-green-200 dark:border-green-700">
              <h3 className="text-lg font-semibold mb-3 dark:text-gray-100 flex items-center">
                <span className="mr-2">🎨</span>
                Frontend Client
              </h3>
              <p className="text-xs text-gray-700 dark:text-gray-300 mb-4">
                A Next.js web application that provides the user interface for
                interacting with AI agents across different models and
                capabilities.
              </p>
              <div className="space-y-2 text-xs">
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
                <code className="text-xs text-gray-700 dark:text-gray-300">
                  Tech Stack: Next.js 14+
                </code>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-700">
              <h3 className="text-lg font-semibold mb-3 dark:text-gray-100 flex items-center">
                <span className="mr-2">🤖</span>
                Agent Orchestration API
              </h3>
              <p className="text-xs text-gray-700 dark:text-gray-300 mb-4">
                The backend service that coordinates AI agents using Google ADK
                for sophisticated multi-model conversations and tool
                integration.
              </p>
              <div className="space-y-2 text-xs">
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
                <code className="text-xs text-gray-700 dark:text-gray-300">
                  Tech Stack: FastAPI, Google ADK
                </code>
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
              </tbody>
            </table>
          </div>
        </div>

        {/* Deployment Models */}
        <div>
          <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">
            Deployment Architecture
          </h2>
          <div className="bg-red-50 dark:bg-red-900/30 p-6 rounded-2xl mb-6 border border-red-200 dark:border-red-700">
            <h3 className="text-lg font-semibold mb-3 dark:text-gray-100 flex items-center">
              <span className="mr-2">🍓</span>
              Raspberry Pi 5 Optimized
            </h3>
            <p className="text-xs text-gray-700 dark:text-gray-300 mb-4">
              This project is specifically optimized for deployment on Raspberry
              Pi 5, using a streamlined single-service architecture that
              maximizes performance and minimizes resource usage on Pi hardware.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-2xl">
              <h3 className="text-lg font-semibold mb-3 dark:text-gray-100">
                Development Mode (Two Services)
              </h3>
              <p className="text-xs text-gray-700 dark:text-gray-300 mb-4">
                During development, run frontend and backend as separate
                services over the network for faster iteration and
                hot-reloading.
              </p>
              <div className="bg-gray-800 text-green-400 p-3 rounded-2xl text-xs font-mono">
                <div># Frontend (port 3000)</div>
                <div>cd services/frontend/</div>
                <div>npm run dev</div>
                <div className="mt-2"># Backend (port 8081)</div>
                <div>cd services/backend/</div>
                <div>uvicorn src.app.main:app --host 0.0.0.0 --port 8081</div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/30 p-6 rounded-2xl">
              <h3 className="text-lg font-semibold mb-3 dark:text-gray-100">
                Production Mode (Single Service)
              </h3>
              <p className="text-xs text-gray-700 dark:text-gray-300 mb-4">
                For Raspberry Pi deployment, the FastAPI backend serves
                pre-rendered static frontend files, creating a unified,
                resource-efficient service.
              </p>
              <div className="bg-gray-800 text-green-400 p-3 rounded-2xl text-xs font-mono">
                <div># Build and deploy on Pi</div>
                <div>source scripts/build.sh</div>
                <div>source scripts/deploy.sh</div>
                <div className="mt-2"># Single service on port 8081</div>
                <div># Serves both static frontend + API</div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4">
            <h4 className="text-base font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              🏗️ Why This Architecture for Raspberry Pi?
            </h4>
            <div className="grid md:grid-cols-2 gap-4 text-xs text-yellow-700 dark:text-yellow-200">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">⚡</span>
                  <span>
                    <strong>Resource Efficiency:</strong> Single process uses
                    less RAM and CPU
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">🔧</span>
                  <span>
                    <strong>Simplified Management:</strong> One service to
                    monitor and restart
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">🌐</span>
                  <span>
                    <strong>Network Simplicity:</strong> Only port 8081 to
                    expose
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">🚀</span>
                  <span>
                    <strong>Fast Startup:</strong> Quick boot times on Pi
                    hardware
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Authentication */}
        <div>
          <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">
            Authentication
          </h2>
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-xs text-yellow-700 dark:text-yellow-200">
                  <strong>
                    ⚠️ This is a simple authentication system suitable for a
                    proof-of-concept and should not be used in production!
                  </strong>
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-700 dark:text-gray-300 mb-4">
            A simple header-based authentication system that provides basic
            access control using a secret code validated on the server.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-base font-semibold mb-3 dark:text-gray-100">
                How it Works
              </h3>
              <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-2">
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
              <h3 className="text-base font-semibold mb-3 dark:text-gray-100">
                Configuration
              </h3>
              <p className="text-xs text-gray-700 dark:text-gray-300 mb-2">
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

          <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4">
            <div className="flex items-start">
              <div className="ml-3">
                <h4 className="text-base font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  🔬 Advanced Engineering Pattern
                </h4>
                <p className="text-xs text-yellow-700 dark:text-yellow-200 mb-2">
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
          <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">
            Try AgentChat
          </h2>
          <Button
            asChild
            className="bg-primary text-white px-8 py-3 rounded-full hover:bg-primary/70 transition-colors text-base"
          >
            <Link href="/">Start Chat with AgentChat</Link>
          </Button>
        </div>

        {/* Repository Structure */}
        <div>
          <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">
            Repository Structure
          </h2>
          <div className="bg-gray-800 text-green-400 p-4 rounded-2xl font-mono text-xs">
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
            Build & Deploy for Raspberry Pi
          </h2>
          <div className="bg-red-50 dark:bg-red-900/30 p-6 rounded-2xl mb-6 border border-red-200 dark:border-red-700">
            <h3 className="text-base font-semibold mb-2 dark:text-gray-100 flex items-center">
              <span className="mr-2">🎯</span>
              Raspberry Pi 5 Deployment Strategy
            </h3>
            <p className="text-xs text-gray-700 dark:text-gray-300 mb-2">
              The system uses a streamlined deployment approach optimized for
              Raspberry Pi 5. The Next.js frontend is pre-rendered into static
              HTML, CSS, and JS files, then served by the FastAPI backend as a
              single unified service. This reduces resource usage and simplifies
              management on Pi hardware.
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
                  Single-service mode optimized for Pi's memory and processing
                  constraints
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-base font-semibold mb-2 dark:text-gray-100">
              Automated Build for Pi
            </h3>
            <div className="bg-gray-800 text-green-400 p-3 rounded-2xl text-xs font-mono mb-2">
              <div># From project root</div>
              <div>source scripts/build.sh</div>
            </div>
            <ul className="text-xs text-gray-700 dark:text-gray-300 list-disc pl-5 mb-2">
              <li>
                Builds Next.js frontend into static files optimized for Pi
                serving
              </li>
              <li>Copies static assets to backend directory structure</li>
              <li>Validates build completion and file integrity</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-base font-semibold mb-2 dark:text-gray-100">
              Automated Deployment on Raspberry Pi
            </h3>
            <div className="bg-gray-800 text-green-400 p-3 rounded-2xl text-xs font-mono mb-2">
              <div># On the Raspberry Pi</div>
              <div>source scripts/deploy.sh</div>
            </div>
            <ul className="text-xs text-gray-700 dark:text-gray-300 list-disc pl-5 mb-2">
              <li>
                Sets up Python virtual environment with Pi-optimized
                dependencies
              </li>
              <li>Clears Python cache and manages port 8081 availability</li>
              <li>
                Starts Uvicorn server in a detached screen session for
                persistence
              </li>
              <li>Provides server management commands for Pi administration</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-base font-semibold mb-2 dark:text-gray-100">
              Pi-Optimized Architecture
            </h3>
            <div className="overflow-x-auto">
              <pre className="bg-gray-100 dark:bg-gray-800 dark:text-gray-300 p-3 rounded text-xs font-mono whitespace-pre">
                {`Development:                 Production (Pi):
[Next.js :3000]              [Static Files]
      ↓                           ↓
[API Proxy]                  [FastAPI :8081]
      ↓                           ↓
[FastAPI :8081]              [Unified Service]

Network: 2 services          Network: 1 service
Memory: ~400MB               Memory: ~200MB
Ports: 3000 + 8081          Ports: 8081 only`}
              </pre>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-base font-semibold mb-2 dark:text-gray-100">
              Raspberry Pi Server Management
            </h3>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-2xl">
              <p className="text-xs text-gray-700 dark:text-gray-300 mb-3">
                The deployment script uses{" "}
                <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">
                  screen
                </code>{" "}
                sessions to run the server persistently on your Raspberry Pi:
              </p>
              <ul className="text-xs text-gray-700 dark:text-gray-300 list-disc pl-5 space-y-1">
                <li>
                  Connect to server:
                  <code className="bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-1 ml-1 rounded">
                    screen -r backend
                  </code>
                </li>
                <li>
                  Detach (keep running):
                  <span className="bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-1 ml-1 rounded">
                    Ctrl+A, then D
                  </span>
                </li>
                <li>
                  List sessions:
                  <code className="bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-1 ml-1 rounded">
                    screen -list
                  </code>
                </li>
                <li>
                  Stop server:
                  <code className="bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-1 ml-1 rounded">
                    screen -S backend -X quit
                  </code>
                </li>
              </ul>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-base font-semibold mb-2 dark:text-gray-100">
              Pi Performance Characteristics
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-2xl">
                <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">
                  Resource Usage
                </h4>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• RAM: 150-300MB (depending on model)</li>
                  <li>• CPU: Low idle, moderate during AI calls</li>
                  <li>• Storage: ~500MB total footprint</li>
                  <li>• Port: 8081 (configurable)</li>
                </ul>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-2xl">
                <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                  Access & Network
                </h4>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <li>
                    • Local: <code>http://localhost:8081</code>
                  </li>
                  <li>
                    • Network: <code>http://[pi-ip]:8081</code>
                  </li>
                  <li>• Dependencies: Pi-optimized packages</li>
                  <li>• Startup: ~5-10 seconds on Pi 5</li>
                </ul>
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

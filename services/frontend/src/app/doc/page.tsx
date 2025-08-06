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
            Collective Bargaining Agreement & Grievance Agent
          </h1>
          <div className="flex justify-center space-x-2 mb-6">
            <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm px-3 py-1 rounded-full">
              Python 3.13+
            </span>
            <span className="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm px-3 py-1 rounded-full">
              Next.js 14.0.0+
            </span>
            <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm px-3 py-1 rounded-full">
              Google Cloud
            </span>
            <span className="inline-block bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-sm px-3 py-1 rounded-full">
              Apache 2.0
            </span>
          </div>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
            An agentic question answering system powered by AI for CBA analysis,
            built with Google Cloud Platform services.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Author / Maintainer:</strong> Loïc Muhirwa
          </p>
        </div>

        {/* Architecture Diagram */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">
            Architecture
          </h2>
          <div className="flex justify-center">
            <Image
              src="/architecture-diagram.png"
              alt="Architecture Diagram"
              width={1000}
              height={600}
              className="rounded-2xl shadow-lg dark:shadow-gray-800"
            />
          </div>
        </div>

        {/* Services */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">
            Services
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-secondary-dark p-6 rounded-2xl">
              <h3 className="text-xl font-semibold mb-3 dark:text-gray-100">
                Frontend Client
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                A Next.js web application that provides the user interface for
                interacting with the CBA analysis system.
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Modern React-based interface</li>
                <li>• Responsive design</li>
                <li>• Real-time chat interface</li>
                <li>• Session management</li>
              </ul>
            </div>
            <div className="bg-gray-50 dark:bg-secondary-dark p-6 rounded-2xl">
              <h3 className="text-xl font-semibold mb-3 dark:text-gray-100">
                Agent Orchestration API
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                The backend service that coordinates AI agents for CBA analysis
                and response generation.
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Understanding user queries</li>
                <li>• CBA analysis</li>
                <li>• Response generation</li>
                <li>• Agent coordination</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Component Usage */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">
            Component Usage
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
                    Vertex AI Search
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">
                    GCP
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">
                    Semantic search for RAG
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
                    Storage for raw CBA files, temporary processing data, and
                    backup storage
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
                    Monitors application performance and tracks data processing
                    operations
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
                    ADK (Agent Development Kit)
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">
                    Development Tool
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">
                    Provides development tools and libraries for building and
                    testing the agentic orchestration
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
            Session Management
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            The system uses session IDs to maintain conversation continuity and
            context preservation across multiple interactions.
          </p>

          <div className="bg-gray-50 dark:bg-secondary-dark p-4 rounded-2xl">
            <h3 className="text-lg font-semibold mb-3 dark:text-gray-100">
              Session Flow
            </h3>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
              <li>
                <strong>Initial Request:</strong> Backend generates new UUID and
                creates session, returns session ID in X-Session-ID header
              </li>
              <li>
                <strong>Subsequent Requests:</strong> Frontend includes
                X-Session-ID header, backend validates and uses existing session
              </li>
              <li>
                <strong>Session State:</strong> Backend maintains session state
                using ADK's InMemorySessionService
              </li>
            </ul>
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

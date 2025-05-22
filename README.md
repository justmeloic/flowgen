# CBA Agent

![Python](https://img.shields.io/badge/python-v3.13+-blue.svg)
![Next.js](https://img.shields.io/badge/next.js-14.0.0+-success.svg)
![GCP](https://img.shields.io/badge/Google_Cloud-4285F4?logo=google-cloud&logoColor=white)
[![License](https://img.shields.io/badge/License-Apache_2.0-orange.svg)](https://opensource.org/licenses/Apache-2.0)

Created by [Loïc Muhirwa](https://github.com/justmeloic)

An agentic question answering system powered by AI for CBA analysis,
built with Google Cloud Platform services.

## Architecture

![Automatic Datastore Refresh Architecture](docs/architecture-diagram.png)

## Session Management

The following diagram illustrates how session IDs are managed between the frontend and backend:

```mermaid
sequenceDiagram
    participant Client
    participant LocalStorage
    participant Frontend
    participant Backend
    participant SessionService

    %% Initial Request without Session ID
    Client->>Frontend: Start conversation
    Frontend->>LocalStorage: Check for existing sessionId
    alt No existing session
        Frontend->>Backend: POST /api/v1/root_agent (no X-Session-ID header)
        Backend->>SessionService: Create new session
        Backend-->>Frontend: Response with new X-Session-ID header
        Frontend->>LocalStorage: Store sessionId
    else Has existing session
        LocalStorage-->>Frontend: Return stored sessionId
        Frontend->>Backend: POST /api/v1/root_agent (with X-Session-ID header)
        Backend->>SessionService: Validate & use existing session
        Backend-->>Frontend: Response with same X-Session-ID
    end

    %% Subsequent Requests
    Note over Client,SessionService: Subsequent Requests
    Client->>Frontend: Send message
    Frontend->>LocalStorage: Get stored sessionId
    LocalStorage-->>Frontend: Return sessionId
    Frontend->>Backend: POST with X-Session-ID header
    Backend->>SessionService: Get existing session
    SessionService-->>Backend: Return session
    Backend-->>Frontend: Response with same X-Session-ID
```

The session management flow works as follows:

1. **Initial Request**:

   - If no session exists, the frontend makes a request without a session ID
   - The backend generates a new UUID and creates a new session
   - The session ID is returned in the X-Session-ID header
   - The frontend stores this ID in localStorage

2. **Subsequent Requests**:

   - The frontend retrieves the session ID from localStorage
   - All requests include the X-Session-ID header
   - The backend validates and uses the existing session
   - The same session ID is returned in responses

3. **Session State**:
   - The backend maintains session state using ADK's InMemorySessionService
   - Each session tracks conversation history and user context
   - Sessions persist as long as the backend service is running

This stateful approach ensures conversation continuity and context preservation across multiple interactions.

## Repository Structure

```
.
└── services/
    ├── agent-orchestration/      # Backend service for AI agent orchestration
    │   ├── pyproject.toml       # Python project dependencies
    │   ├── src/                 # Source code for agent orchestration
    │   └── uv.lock              # Dependency lock file
    │
    └── front-end/              # Next.js web application
```

## Services

### Frontend Client (services/front-end)

A Next.js web application that provides the user interface for interacting with the CBA analysis system.

### Agent Orchestration (services/agent-orchestration)

The backend service that coordinates AI agents for:

- Understanding user queries
- CBA analysis
- Response generation

## Component Usage

| Component                   | Type             | Description                                                                                 |
| --------------------------- | ---------------- | ------------------------------------------------------------------------------------------- |
| GCS Bucket                  | GCP              | Storage for raw CBA files, temporary processing data, and backup storage                    |
| Cloud Logging               | GCP              | Monitors application performance and tracks data processing operations                      |
| Cloud Run                   | GCP              | Hosts containerized services for web interfaces and APIs                                    |
| ADK (Agent Development Kit) | Development Tool | Provides development tools and libraries for building and testing the agentic orchestration |

## Setup

Each service has its own README with specific setup instructions. Please refer to:

- [Frontend Setup](services/frontend/README.md)
- [Agent Orchestration Setup](services/agent-orchestration/README.md)

## License

This project is licensed under the Apache License, Version 2.0 - see the [LICENSE](LICENSE) file for details.

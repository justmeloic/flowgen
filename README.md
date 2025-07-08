<div align="center">
  <img src="services/frontend/public/CN_Railway_logo.svg">

  <br>
</div>

---

# Collective Bargaining Agreement & Grievance Agent

![Python](https://img.shields.io/badge/python-v3.13+-blue.svg)
![Next.js](https://img.shields.io/badge/next.js-14.0.0+-success.svg)
![GCP](https://img.shields.io/badge/Google_Cloud-4285F4?logo=google-cloud&logoColor=white)
[![License](https://img.shields.io/badge/License-Apache_2.0-orange.svg)](https://opensource.org/licenses/Apache-2.0)

**Author / Maintainer:** [Loïc Muhirwa](https://github.com/justmeloic)

An agentic question answering system powered by AI for CBA analysis,
built with Google Cloud Platform services.

## Services

Each service has its own README with specific setup instructions. Please refer to:

- [Frontend Setup](services/frontend/README.md)
- [Agent Orchestration Setup](services/agent-orchestration/README.md)

### Frontend Client (services/front-end)

A Next.js web application that provides the user interface for interacting with the CBA analysis system.

### Agent Orchestration API (services/agent-orchestration)

The backend service that coordinates AI agents for:

- Understanding user queries
- CBA analysis
- Response generation

## Repository Structure

```
.
├── docs
├── scripts
│   └── deploy.sh
└── services
    ├── agent-orchestration
    │   ├── pyproject.toml
    │   ├── src
    │   ├── static_frontend
    │   ├── tests
    │   └── uv.lock
    └── frontend
        ├── components.json
        ├── next-env.d.ts
        ├── next.config.mjs
        ├── package-lock.json
        ├── package.json
        ├── postcss.config.mjs
        ├── public
        ├── src
        ├── tailwind.config.js
        └── tsconfig.json
```

## Architecture

![Automatic Datastore Refresh Architecture](docs/architecture-diagram.png)

## Component Usage

| Component                   | Type             | Description                                                                                 |
| --------------------------- | ---------------- | ------------------------------------------------------------------------------------------- |
| Vertext AI Search           | GCP              | Semantic search for RAG                                                                     |
| GCS Bucket                  | GCP              | Storage for raw CBA files, temporary processing data, and backup storage                    |
| Cloud Logging               | GCP              | Monitors application performance and tracks data processing operations                      |
| Cloud Run                   | GCP              | Hosts containerized services for web interfaces and APIs                                    |
| ADK (Agent Development Kit) | Development Tool | Provides development tools and libraries for building and testing the agentic orchestration |

## Deployment Models

This project is structured to support two primary deployment models, offering flexibility based on your operational needs, team structure, and scaling requirements. The choice of model can impact local development, testing, and production rollout.

### 1. Independent Services (Microservice-Style)

In this model, the Next.JS frontend and the FastAPI backend are deployed and managed as separate, independent services.

### _Dev_

```bash
cd services/frontend/
npm run dev
```

```bash
cd services/agent-orchestration/src/
uv run app.py
```

**Architecture:**

```mermaid
graph TD
  subgraph Frontend Service
    A1[Next.js App] --> A2[npm run dev]
  end

  subgraph Backend Service
    B1[FastAPI App] --> B2[uv run app.py]
  end

  A1 <-->|"API Calls"| B1
```

### 2. Modular Monolith (Combined Deployment)

In this model, the FastAPI backend serves the static assets generated from the Next.JS frontend, creating a single deployable unit. This is the model facilitated by the npm run build script in the frontend service, which prepares assets for the backend.

### _Dev_

```bash
cd services/frontend/
npm run build-local # This builds the static (pre-rendered into HTML, CSS, and JavaScript files) frontend into "out" and copies it over to the backend agent-orchestration/build/static_frontend

cd ../agent-orchestration/src/
uv run app.py # Services backend with agent-orchestration/build/static_frontend mounted
```

**Architecture:**

```mermaid
graph TD
  subgraph Build Process
    C1[Next.js App] --> C2[npm run build]
    C2 --> C3[Static Assets: HTML/CSS/JS]
    C3 --> C4[Copy to Backend static_frontend/]
  end

  subgraph Unified Service
    D1[FastAPI App] --> D2[Serves Static Frontend]
    D1 --> D3[API Endpoints]
    C4 --> D2
  end
```

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

## Authentication

This is a simple client-side authentication system implemented for the CBA Agent PoC. It provides basic access control using a secret code.

## How it Works

1. **Login Page**: Users are redirected to `/login` when they try to access any protected page
2. **Secret Code**: Users must enter the correct access code to gain access
3. **Session Storage**: Authentication state is stored in the browser's sessionStorage
4. **Session Expiry**: Authentication expires after 24 hours
5. **Logout**: Users can logout using the logout button in the header

## Configuration

The authentication is configured in `src/lib/auth-config.ts` and uses environment variables:

```typescript
export const AUTH_CONFIG = {
  SECRET: process.env.NEXT_PUBLIC_AUTH_SECRET || "cn-cba-2025",
  SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  STORAGE_KEYS: {
    AUTHENTICATED: "cba_authenticated",
    TIMESTAMP: "cba_auth_timestamp",
    REDIRECT: "cba_redirect_after_login",
  },
};
```

## Environment Variables

Add the following to your `.env.local` file:

```bash
NEXT_PUBLIC_AUTH_SECRET=your-secret-here
```

For different environments, you can set different secrets:

- `.env.development.local` - for development
- `.env.local` - for production build
- `.env.production.local` - for production

## Usage

### Default Secret Code

The default secret code is: `cn-cba-2025`

### Changing the Secret Code

To change the secret code, update the `NEXT_PUBLIC_AUTH_SECRET` environment variable in your `.env.local` file

### Session Duration

To change how long the session lasts, modify the `SESSION_DURATION` value (in milliseconds)

## Components

- **Login Page**: `/src/app/login/page.tsx` - The login form
- **useAuth Hook**: `/src/hooks/useAuth.ts` - Authentication logic
- **ProtectedRoute**: `/src/components/protected-route.tsx` - Wrapper for protected pages
- **Header**: `/src/components/header.tsx` - Updated to include logout button

## Security Notes

⚠️ **This is a PoC authentication system and should not be used in production!**

- The secret is hardcoded in the client-side code
- No server-side validation
- Uses sessionStorage which can be manipulated by users
- No rate limiting or brute force protection

For production use, consider implementing:

- Server-side authentication
- JWT tokens
- Database user management
- Password hashing
- Rate limiting
- HTTPS enforcement
- Security headers

## Building and Deploying

After making changes to the frontend, remember to build the static files:

```bash
cd services/frontend
npm run build-static
```

The build output will be in the `out/` directory and needs to be copied to the backend's static folder for deployment.

## License

This project is licensed under the Apache License, Version 2.0 - see the [LICENSE](LICENSE) file for details.

[core]
repositoryformatversion = 0
filemode = true
bare = false
logallrefupdates = true
ignorecase = true
precomposeunicode = true
[remote "origin"]
url = https://github.com/justmeloic/cn-cba-agent.git
fetch = +refs/heads/_:refs/remotes/origin/_
pushurl = https://github.com/justmeloic/cn-cba-agent.git
pushurl = git@gitlab.com:google-cloud-ce/communities/genai-fsa/northam/expert_requests/canadian-national-railway/cba-agent.git
[branch "main"]
remote = origin
merge = refs/heads/main
[pull]
ff = only
rebase = true

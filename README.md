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

| Component                   | Type             | Description                                                                                                         |
| --------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------- |
| GCS Bucket                  | GCP              | Storage for raw CBA files, temporary processing data, and backup storage                                         |
| Cloud Logging               | GCP              | Monitors application performance and tracks data processing operations                                              |
| Cloud Run                   | GCP              | Hosts containerized services for web interfaces and APIs                                                            |
| ADK (Agent Development Kit) | Development Tool | Provides development tools and libraries for building and testing the agentic orchestration                         |

## Setup

Each service has its own README with specific setup instructions. Please refer to:

- [Frontend Setup](services/front-end/README.md)
- [Agent Orchestration Setup](services/agent-orchestration/README.md)

## License

This project is licensed under the Apache License, Version 2.0 - see the [LICENSE](LICENSE) file for details.

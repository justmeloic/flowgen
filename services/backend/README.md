# Architecture Designer API

![Python](https://img.shields.io/badge/python-v3.13+-blue.svg)
![Google ADK](https://img.shields.io/badge/Google_ADK-0.2.0+-4285F4.svg)
![GCP](https://img.shields.io/badge/Google_Cloud-4285F4?logo=google-cloud&logoColor=white)
![Mermaid](https://img.shields.io/badge/Mermaid-Architecture%20Diagrams-FF6B6B.svg)

Backend service that provides AI-powered architecture design assistance, generating comprehensive system diagrams and technical documentation. In production, also serves the static frontend files for unified deployment.

## Features

- AI-powered architecture design and analysis
- Mermaid diagram generation for system architectures
- Requirements analysis and constraint evaluation
- Pattern matching and best practice recommendations
- Static frontend hosting for single-service deployment

## Development Setup

### Prerequisites

- Python 3.13+
- uv package manager
- Google Cloud CLI with Vertex AI access

### Quick Start

```bash
# From project root - start both services
make dev

# Or run backend only
make dev
```

### Environment Setup

```bash
# Install dependencies
make install

# Set up Google Cloud authentication
gcloud auth application-default login

# Configure environment (see Configuration section)
cp .env.example .env
```

### Configuration

Create `.env` file with your settings:

```bash
# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_GENAI_USE_VERTEXAI=TRUE

# Application Configuration
FRONTEND_URL=http://localhost:3000
```

## Deployment Architecture

### Development Mode

- Backend serves API at `http://localhost:8081`
- Frontend dev server at `http://localhost:3000` proxies to backend

### Production Mode

- Frontend built into static files in `build/static_frontend/`
- Backend serves both API and static frontend at `http://localhost:8081`
- Single deployable unit requiring only Python runtime

## API Endpoints

Once running, access:

- **API Documentation**: `http://localhost:8081/docs`
- **Alternative Docs**: `http://localhost:8081/redoc`
- **Static Frontend** (after build): `http://localhost:8081`

### Key Endpoints

#### Mermaid Diagram Editing

- `POST /api/v1/mermaid/edit` - AI-powered diagram editing service
  - Edit Mermaid diagrams using natural language instructions
  - Independent of main conversation flow
  - Supports all Mermaid diagram types (flowchart, sequence, class, etc.)
  - Returns edited Mermaid code directly

#### Chat & Agent Interactions

- `POST /api/v1/chat/{agent_id}/message` - Send messages to AI agents
- `POST /api/v1/chat/session/{session_id}/model` - Switch AI models mid-conversation
- Session management with conversation continuity across model switches

## Testing

Run the comprehensive test suite:

```bash
# Run all tests
make test

# Run with verbose output
make test-verbose

# Run with coverage report
make test-coverage
```

## Deployment

The backend is designed for unified deployment:

1. **Build frontend**: `make build` (from project root)
2. **Deploy**: Single Python service serves everything
3. **Runtime**: Requires only Python 3.13+ environment

Perfect for containerized deployments, serverless functions, or traditional hosting.

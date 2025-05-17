# Agent Orchestration

![Python](https://img.shields.io/badge/python-v3.13+-blue.svg)
![Google ADK](https://img.shields.io/badge/Google_ADK-0.2.0+-4285F4.svg)
![GCP](https://img.shields.io/badge/Google_Cloud-4285F4?logo=google-cloud&logoColor=white)

Backend service that coordinates AI agents for the Tariff Agent system.

## System Architecture

The following diagram illustrates the high-level architecture of the agent orchestration system:

```mermaid
graph TD
    subgraph "User Interaction"
        User[/"CN Employee (User)"/]
    end

    subgraph "Core Agent System"
        Supervisor[Supervisor Agent]

        subgraph "Specialized Sub-Agents"
            ContextAgent[Context Identification Agent]
            CBARetrievalAgent[CBA Information Retrieval Agent]
            PolicyAgent[Railway Policy & External Information Agent]
            JargonAgent[Railway Jargon & Clarification Agent]
        end

        subgraph "Supervisor Tools"
            ToolAskUser[Tool: Ask Clarifying Question to User]
            ToolDelegate[Tool: Delegate to SubAgent]
            ToolSynthesize[Tool: Synthesize Information]
        end

        subgraph "CBA Retrieval Agent Tools"
            ToolVertexSearch[Tool: Vertex AI DataStore Search]
        end

        subgraph "Policy Agent Tools"
            ToolCanadaLabourCode[Tool: Canada Labour Code Search]
            ToolCNPolicyDB[Tool: CN Policy Update DB Search]
            ToolWebSearch[Tool: General Web Search]
        end

        subgraph "Jargon Agent Tools"
            ToolJargonGlossary[Tool: Jargon Glossary Lookup]
        end
    end

    subgraph "External Data Sources"
        VertexDS[("Vertex AI Datastore (CBAs)")]
        CanadaLabourCodeDB[("Canada Labour Code DB")]
        CNPolicyDB[("CN Policy Update DB")]
        JargonGlossaryDB[("Jargon Glossary DB")]
        WebSearchSource[("General Web")]
    end

    %% Connections
    User --> Supervisor

    Supervisor -->|1. Initial Query Analysis| Supervisor
    Supervisor -- "If context needed" --> ToolAskUser
    ToolAskUser --> Supervisor
    Supervisor -- "If context needed via agent" --> ContextAgent
    ContextAgent -->|"Structured Context"| Supervisor

    Supervisor -- "Delegate Task" --> ToolDelegate
    ToolDelegate -->|To CBA Retrieval| CBARetrievalAgent
    ToolDelegate -->|To Policy Agent| PolicyAgent
    ToolDelegate -->|To Jargon Agent| JargonAgent

    CBARetrievalAgent --> ToolVertexSearch
    ToolVertexSearch --> VertexDS
    VertexDS --> ToolVertexSearch
    ToolVertexSearch --> CBARetrievalAgent
    CBARetrievalAgent -->|"Retrieved CBA Snippets"| Supervisor

    PolicyAgent --> ToolCanadaLabourCode
    ToolCanadaLabourCode --> CanadaLabourCodeDB
    CanadaLabourCodeDB --> ToolCanadaLabourCode
    ToolCanadaLabourCode --> PolicyAgent

    PolicyAgent --> ToolCNPolicyDB
    ToolCNPolicyDB --> CNPolicyDB
    CNPolicyDB --> ToolCNPolicyDB
    ToolCNPolicyDB --> PolicyAgent

    PolicyAgent --> ToolWebSearch
    ToolWebSearch --> WebSearchSource
    WebSearchSource --> ToolWebSearch
    ToolWebSearch --> PolicyAgent
    PolicyAgent -->|"Policy/External Info"| Supervisor

    JargonAgent --> ToolJargonGlossary
    ToolJargonGlossary --> JargonGlossaryDB
    JargonGlossaryDB --> ToolJargonGlossary
    ToolJargonGlossary --> JargonAgent
    JargonAgent -->|"Jargon Clarification"| Supervisor

    Supervisor -- "Synthesize & Format" --> ToolSynthesize
    ToolSynthesize -->|"Final Answer"| Supervisor
    Supervisor --> User

    %% Styling (Optional - basic for clarity)
    classDef agent fill:#D6EAF8,stroke:#5DADE2,stroke-width:2px;
    classDef tool fill:#E8DAEF,stroke:#A569BD,stroke-width:2px;
    classDef datasource fill:#D5F5E3,stroke:#58D68D,stroke-width:2px;
    classDef user fill:#FCF3CF,stroke:#F7DC6F,stroke-width:2px;

    class User user;
    class Supervisor,ContextAgent,CBARetrievalAgent,PolicyAgent,JargonAgent agent;
    class ToolAskUser,ToolDelegate,ToolSynthesize,ToolVertexSearch,ToolCanadaLabourCode,ToolCNPolicyDB,ToolWebSearch,ToolJargonGlossary tool;
    class VertexDS,CanadaLabourCodeDB,CNPolicyDB,JargonGlossaryDB,WebSearchSource datasource;
```

The diagram shows the interaction between different components of the system:
- User Interaction: How CN employees interact with the system
- Core Agent System: The Supervisor Agent and specialized sub-agents
- Tools: Various capabilities available to each agent
- External Data Sources: The different data sources the system can query

## Development Setup

### Prerequisites

- Python 3.13+
- uv package manager
- Google Cloud CLI
- Access to GCP project with enabled APIs:
  - Vertex AI
  - BigQuery
  - Cloud Storage

### Environment Setup

```bash
# Install uv if not already installed
pip install uv

# Create virtual environment and install dependencies
uv venv
source .venv/bin/activate  # or `.venv\Scripts\activate` on Windows
uv pip install -r requirements.txt
```

### Configuration

```bash
# Set up Google Cloud authentication
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="your-project-id"
```

## API Documentation

The API follows a versioned structure to ensure backward compatibility and easy evolution of the service.

### Base URLs

- Local Development: `http://localhost:8000`
- Documentation: 
  - Swagger UI: `/docs`
  - ReDoc: `/redoc`
  - OpenAPI JSON: `/openapi.json`

### API Versioning

All API endpoints (except documentation) are versioned using the format: `/api/v{version_number}/`

Current version: `v1`

### Endpoints

#### Root Endpoint

```
GET /

Returns basic API information including:
- API title
- Description
- Version
- Status
- Documentation URLs
```

#### Root Agent Endpoint

```
POST /api/v1/root_agent/

Process queries through the root agent.

Request Body:
{
    "text": string  // The query text (required, non-empty)
}

Response:
{
    "response": string  // The agent's response
}

Example:
curl -X POST http://localhost:8000/api/v1/root_agent/ \
  -H "Content-Type: application/json" \
  -d '{"text": "What are the latest tariff changes between US and China?"}'
```

### Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 404: Not Found
- 422: Validation Error
- 500: Internal Server Error

## Running the Service

```bash
# Start the development server
uv run src/app.py
```

## Testing

### Running Tests

```bash
# Run all tests
pytest

# Run tests with coverage report
pytest  # Coverage is enabled by default

# Run specific test file
pytest tests/test_root_agent.py
```

### Test Coverage Requirements

The project requires a minimum test coverage of 80%. Current coverage areas:

1. **Well-Covered (>80%)**
   - Base agent functionality
   - Current impact agent core
   - Latest news agent
   - API endpoint structure

2. **Needs Improvement**
   - Prompt templates and configurations
   - Agent tools and utilities
   - Application lifecycle management
   - Error handling paths

To improve coverage:
1. Add test cases for error scenarios
2. Test configuration variations
3. Mock external dependencies
4. Add integration tests for agent tools
5. Test concurrent and edge cases

### Test Structure

```
tests/
├── conftest.py         # Test configuration and fixtures
├── test_root_agent.py  # Root agent endpoint tests
└── ...
```

### Test Categories

1. **Endpoint Structure Tests**
   - Validate API versioning
   - Check endpoint availability
   - Verify response formats

2. **Input Validation Tests**
   - Empty queries
   - Invalid payloads
   - Special characters

3. **Integration Tests**
   - Full request-response cycle
   - Agent interaction
   - Error handling

4. **Concurrent Request Tests**
   - Multiple simultaneous requests
   - Session management
   - Resource handling

### Coverage Configuration

Coverage settings are defined in `pyproject.toml`:
- Minimum coverage: 80%
- Branch coverage enabled
- Excludes initialization files
- Reports missing lines
- Ignores common boilerplate

## Project Structure

```
agent-orchestration/
├── src/
│   ├── agents/        # Agent implementations
│   ├── models/        # Data models
│   └── utils/         # Utility functions
├── tests/            # Test suite
├── pyproject.toml    # Project configuration
└── uv.lock          # Dependency lock file
```


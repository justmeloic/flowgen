# Architecture Designer API

![Python](https://img.shields.io/badge/python-v3.13+-blue.svg)
![Google ADK](https://img.shields.io/badge/Google_ADK-0.2.0+-4285F4.svg)
![GCP](https://img.shields.io/badge/Google_Cloud-4285F4?logo=google-cloud&logoColor=white)
![Mermaid](https://img.shields.io/badge/Mermaid-Architecture%20Diagrams-FF6B6B.svg)

Backend service that provides AI-powered architecture design assistance, generating comprehensive system diagrams and technical documentation.

## System Architecture

### High-Level Architecture

The following diagram illustrates the high-level architecture of the architecture design system:

```mermaid
graph TD
    A[User] -- Describes Requirements --> B(Architecture Designer Agent);
    B -- Analyzes & Questions --> C{Requirement Analysis};
    C -- Gathers Context --> D[Requirements Database];
    C -- Identifies Patterns --> E[Architecture Patterns];
    C -- Analyzes Constraints --> F[Technical Constraints];
    D --> G[Solution Generation];
    E --> G;
    F --> G;
    G -- Generates --> H[Mermaid Diagram];
    G -- Provides --> I[Implementation Guide];
    H --> J[Frontend Visualization];
    I --> J;
    J -- Interactive Diagram --> A;

    style B fill:#f9f,stroke:#333,stroke-width:2px
    style C fill:#bbf,stroke:#333,stroke-width:2px
    style G fill:#lightgreen,stroke:#333,stroke-width:2px
    style H fill:#orange,stroke:#333,stroke-width:2px
    style J fill:#lightblue,stroke:#333,stroke-width:2px
```

### Architecture Design Workflow

The Architecture Designer provides intelligent assistance throughout the design process, leveraging AI to understand requirements and generate comprehensive solutions.

#### How It Works

Our system guides users through a structured architecture design process:

```mermaid
graph TB
    subgraph "Frontend Interface"
        UI[User Interface]
        VIZ[Diagram Visualization]
    end

    subgraph "Backend - Architecture Designer"
        EP[Design Endpoint]
        AA[Architecture Analyzer]
        PG[Pattern Generator]
    end

    subgraph "AI Processing Layer"
        REQ[Requirements Analysis]
        CON[Constraint Evaluation]
        PAT[Pattern Matching]
    end

    subgraph "Generation Engine"
        MG[Mermaid Generator]
        DG[Documentation Generator]
        VG[Validation Engine]
    end

    subgraph "Google Vertex AI"
        GM[Gemini Models]
    end

    UI --> |"Describe System"| EP
    EP --> |"Process"| AA
    AA --> |"Analyze"| REQ
    AA --> |"Evaluate"| CON
    AA --> |"Match"| PAT

    REQ --> |"Context"| MG
    CON --> |"Constraints"| MG
    PAT --> |"Patterns"| MG

    MG --> |"Generate"| DG
    DG --> |"Validate"| VG
    VG --> |"Refined Output"| VIZ

    AA --> GM
    MG --> GM
    DG --> GM

    style AA fill:#e1f5fe,stroke:#0277bd,stroke-width:3px
    style MG fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    style VIZ fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    style GM fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
```

#### Key Architecture Components

1. **Architecture Analyzer**

   ```python
   def analyze_requirements(self, description: str) -> ArchitectureAnalysis:
       # Processes user requirements and identifies key patterns
   ```

2. **Mermaid Generator**

   ```python
   def generate_diagram(self, analysis: ArchitectureAnalysis) -> str:
       # Creates comprehensive Mermaid diagrams based on analysis
   ```

3. **Pattern Matching Engine**
   - **Common Patterns**: Identifies microservices, monolithic, serverless patterns
   - **Best Practices**: Applies industry standards and architectural principles
   - **Constraint Optimization**: Balances requirements with technical constraints

#### Benefits

✅ **Comprehensive Analysis**: Deep understanding of requirements and constraints  
✅ **Pattern Recognition**: Automatic identification of appropriate architectural patterns  
✅ **Visual Diagrams**: Beautiful, interactive Mermaid diagrams  
✅ **Implementation Guidance**: Step-by-step recommendations for development

The diagram shows the interaction between different components of the system:

- User Requirements: How users describe their system needs
- AI Analysis: Intelligent processing and pattern recognition
- Diagram Generation: Creation of comprehensive Mermaid visualizations
- Interactive Feedback: Real-time refinement and optimization

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
uv sync
```

### Configuration

1. Set up Google Cloud authentication:

```bash
gcloud auth application-default login
```

2. Configure environment variables:

```bash
# Copy the example environment file
cp .env.example .env

# Open the .env file and update the following variables:
# - GOOGLE_CLOUD_PROJECT: Your GCP project ID
# - GOOGLE_CLOUD_LOCATION: Your GCP region (e.g., us-central1)
# - FRONTEND_URL: Your frontend URL (default: http://localhost:3000)
# - GOOGLE_CSE_ID: Your Google Custom Search Engine ID (if using)
# - CUSTOM_SEARCH_API_KEY: Your Custom Search API key (if using)
```

For the Vertex AI configuration, ensure `GOOGLE_GENAI_USE_VERTEXAI=TRUE` is set in your `.env` file to use Vertex AI API through your GCP project.

If you prefer to use the Google AI Studio API directly, set `GOOGLE_GENAI_USE_VERTEXAI=FALSE` and provide your `GOOGLE_API_KEY`.

### Running the Server

Start the development server:

```bash
make dev
```

The server will be available at `http://localhost:8000`. The development mode enables auto-reloading when code changes are detected during development.

### Testing

The project includes comprehensive tests for file upload functionality and core components. All tests are located in the `tests/` directory.

#### Running Tests

Run all tests using pytest:

```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/test_implementation.py

# Run tests with coverage report
pytest --cov=src --cov-report=term-missing
```

#### Test Structure

- `tests/test_implementation.py` - Integration tests for file processors and validators
- Test configuration is managed in `pyproject.toml`
- Coverage target is set to 65% (configurable in pyproject.toml)

#### Test Coverage

The tests cover:

- ✅ File processors (text, JSON, images, PDFs, code)
- ✅ File validators (MIME type detection, size limits, security)
- ✅ Component integration and error handling

For development, you can also run the implementation test directly:

```bash
python tests/test_implementation.py
```

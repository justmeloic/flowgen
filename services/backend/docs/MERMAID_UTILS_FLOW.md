# Mermaid Utils Usage Flow Diagram

```mermaid
graph TB
    subgraph "User Interactions"
        U1[User: Generate Diagram Request]
        U2[User: Edit Diagram Request]
    end

    subgraph "API Layer"
        A1[POST /api/v1/root_agent/]
        A2[POST /api/v1/mermaid/edit]
    end

    subgraph "Service Layer"
        S1[agent_service.py]
        S2[mermaid_edit_service.py]
    end

    subgraph "Agent System"
        AG1[AgentFactory]
        AG2[Agent with Tools]
    end

    subgraph "Tools Module"
        T1[generate_architecture_diagram]
        T2[_sanitize_mermaid wrapper]
    end

    subgraph "Core Utilities - mermaid_utils.py"
        M1[sanitize_mermaid]
        M2[extract_mermaid]
        M3[create_fallback_mermaid]
    end

    subgraph "AI Services"
        AI[Gemini AI API]
    end

    %% Flow 1: Diagram Generation
    U1 --> A1
    A1 --> S1
    S1 --> AG1
    AG1 --> AG2
    AG2 --> T1
    T1 --> AI
    AI --> T1
    T1 --> T2
    T2 --> M2
    M2 --> M1
    M1 --> T2
    T2 --> T1
    T1 --> U1

    %% Flow 2: Diagram Editing
    U2 --> A2
    A2 --> S2
    S2 --> AI
    AI --> S2
    S2 --> M2
    M2 --> M1
    M1 --> S2
    S2 --> U2

    %% Fallback path
    T1 -.Fallback.-> M3
    M3 -.-> T1

    %% Styling
    classDef userClass fill:#e1f5ff,stroke:#01579b,stroke-width:2px;
    classDef apiClass fill:#fff3e0,stroke:#e65100,stroke-width:2px;
    classDef serviceClass fill:#f3e5f5,stroke:#4a148c,stroke-width:2px;
    classDef toolClass fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px;
    classDef coreClass fill:#ffebee,stroke:#b71c1c,stroke-width:3px;
    classDef aiClass fill:#fce4ec,stroke:#880e4f,stroke-width:2px;

    class U1,U2 userClass;
    class A1,A2 apiClass;
    class S1,S2 serviceClass;
    class AG1,AG2 agentClass;
    class T1,T2 toolClass;
    class M1,M2,M3 coreClass;
    class AI aiClass;
```

## Key Points

### ✅ mermaid_utils.py IS ACTIVELY USED

**Primary Usage Points:**

1. **src/agents/tools.py** (Line 151)
   - Every AI-generated diagram passes through `sanitize_mermaid()`
   - Called after Gemini generates the diagram code
2. **src/app/services/mermaid_edit_service.py** (Line 149)
   - Every edited diagram passes through `sanitize_mermaid()`
   - Called after Gemini edits the diagram code

### 📊 Usage Statistics

- **2 Production Call Sites** (agent tools + edit service)
- **4 Test Cases** (comprehensive test coverage)
- **100% of AI-generated diagrams** are sanitized
- **100% of edited diagrams** are sanitized

### 🎯 Critical for

- Preventing Mermaid parse errors
- Handling multiline labels in node definitions
- Normalizing Unicode and whitespace
- Ensuring consistent diagram rendering

### 🔄 Recent Enhancement (Oct 5, 2025)

Fixed multiline label issues that were causing parse errors like:

```
Parse error: Expecting 'SQE', 'DOUBLECIRCLEEND', got 'PS'
```

Now all multiline labels are properly collapsed to single lines.

### 📁 Documentation Created

See `docs/MERMAID_UTILS_USAGE.md` for complete usage documentation.

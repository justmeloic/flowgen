# Agents Package

This package contains the AI agent system for FlowGen, organized into separate modules for maintainability and clarity.

## Structure

```
agents/
├── __init__.py           # Package exports
├── agent_factory.py      # Main factory for creating agents
├── callbacks.py          # Agent lifecycle callbacks
├── tools.py             # Agent tools and functions
└── system_instructions.py # Agent prompts and instructions
```

## Modules

### `agent_factory.py`

- **AgentFactory**: Main class for creating and managing agent instances
- Handles model configuration and caching
- Coordinates tools and callbacks

### `callbacks.py`

- **store_tool_result_callback**: Stores tool results in agent state
- **before_model_callback**: Intercepts LLM calls for diagram generation

### `tools.py`

- **generate_architecture_diagram**: Creates Mermaid diagrams from descriptions
- Can be extended with additional tools as needed

### `system_instructions.py`

- Contains prompts and instructions for different agent types
- Defines agent behavior and capabilities

## Usage

```python
from src.agents import agent_factory

# Get an agent for a specific model
agent = agent_factory.get_agent('gemini-1.5-flash')

# Use the agent with ADK Runner
runner = Runner(agent=agent, app_name="my_app", session_service=session_service)
```

## Diagram Generation Flow

1. **Tool Execution**: `generate_architecture_diagram()` creates diagram data
2. **State Storage**: `store_tool_result_callback()` saves result in agent state
3. **LLM Interception**: `before_model_callback()` returns direct response
4. **Response Processing**: Backend separates text from diagram JSON using `<START_OF_DIAGRAM_DATA>`

This modular package structure makes it easy to:

- Add new tools and capabilities
- Modify agent behavior through callbacks
- Test components independently
- Maintain clean separation of concerns

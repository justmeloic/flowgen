# Copyright 2025 Loïc Muhirwa
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Agent factory for creating and managing multiple model instances."""

import json
from functools import lru_cache
from typing import Any, Dict, Optional

from google.adk.agents import Agent
from google.adk.agents.callback_context import CallbackContext
from google.adk.models.llm_response import LlmResponse
from google.adk.tools import FunctionTool, google_search
from google.adk.tools.base_tool import BaseTool
from google.adk.tools.tool_context import ToolContext
from google.genai.types import Content, Part
from loguru import logger as _logger

try:
    from src.lib.config import settings

    from .system_instructions import get_general_assistant_instructions
except ImportError:
    # Handle direct script execution (for quick testing)
    from system_instructions import get_general_assistant_instructions

    from src.lib.config import settings


def generate_architecture_diagram(description: str) -> Dict[str, Any]:
    """Generate a mermaid architecture diagram based on the description.

    Use this tool when the user asks for system architecture visualization,
    workflow diagrams, or wants to see how components interact. The tool
    creates a Mermaid diagram showing system flow and relationships.

    Args:
        description: Description of the system or workflow to diagram

    Returns:
        A dictionary with status and diagram information.
        On success: {'status': 'success', 'diagram_code': '...',
                     'diagram_type': 'mermaid', ...}
        On error: {'status': 'error', 'error_message': 'Description of the error'}
    """
    try:
        if not description or not description.strip():
            return {'status': 'error', 'error_message': 'Description cannot be empty'}

        # Mock implementation - create a simple mermaid diagram based on description
        diagram_code = f"""graph TD
    A[User Input] --> B[Processing Engine]
    B --> C[Analysis Module]
    C --> D[Response Generation]
    D --> E[Output]
    
    %% Description: {description}
    %% Generated diagram showing system flow"""

        return {
            'status': 'success',
            'diagram_code': diagram_code,
            'diagram_type': 'mermaid',
            'description': description,
            'title': 'System Architecture Diagram',
        }
    except Exception as e:
        return {
            'status': 'error',
            'error_message': f'Failed to generate diagram: {str(e)}',
        }


def store_tool_result_callback(
    tool: BaseTool,
    args: Dict[str, Any],
    tool_context: ToolContext,
    tool_response: Dict[str, Any],
) -> Optional[Dict[str, Any]]:
    """Stores the raw response from tools in the agent state."""
    try:
        if tool.name == 'generate_architecture_diagram':
            tool_context.state['architecture_diagram_tool_raw_output'] = tool_response
            _logger.info(
                '[store_tool_result_callback] Stored response for tool %s',
                tool.name,
            )
        return None
    except Exception as e:
        _logger.error('Error in store_tool_result_callback: %s', e)
        return None


def after_model_callback(
    callback_context: CallbackContext, llm_response: LlmResponse
) -> Optional[LlmResponse]:
    """Injects diagram data into the final response content."""
    try:
        # Get the original LLM text
        original_llm_text = ''
        if llm_response.content and llm_response.content.parts:
            if llm_response.content.parts[0].text:
                original_llm_text = llm_response.content.parts[0].text
            else:
                return None
        else:
            return None

        # Check for architecture diagram tool output
        diagram_tool_raw_output = callback_context.state.get(
            'architecture_diagram_tool_raw_output'
        )
        if diagram_tool_raw_output:
            # Clear the state to prevent reuse in subsequent turns
            callback_context.state['architecture_diagram_tool_raw_output'] = None

            diagram_data_text = json.dumps(diagram_tool_raw_output)

            # Combine original text and diagram data using special token
            final_text = (
                f'{original_llm_text}<START_OF_DIAGRAM_DATA>{diagram_data_text}'
            )
            content_with_diagram = Content(parts=[Part(text=final_text)])

            return LlmResponse(
                content=content_with_diagram,
                grounding_metadata=llm_response.grounding_metadata,
            )

        return None

    except Exception as e:
        _logger.error('Error in after_model_callback: %s', e)
        return None


class AgentFactory:
    """Factory for creating and managing agent instances for different models."""

    def __init__(self):
        """Initialize the agent factory."""
        self._agent_cache: Dict[str, Agent] = {}
        self._available_models = settings.AVAILABLE_MODELS
        _logger.info(
            f'AgentFactory initialized with '
            f'{len(self._available_models)} available models'
        )

    @lru_cache(maxsize=10)
    def get_agent(self, model_name: str) -> Agent:
        """Get or create an agent for the specified model.

        Args:
            model_name: The name of the model to create an agent for.

        Returns:
            An Agent instance configured for the specified model.

        Raises:
            ValueError: If the model name is not supported.
        """
        if model_name not in self._available_models:
            available = list(self._available_models.keys())
            raise ValueError(
                f"Model '{model_name}' not supported. Available models: {available}"
            )

        if model_name not in self._agent_cache:
            model_config = self._available_models[model_name]

            # Create base tools list
            tools = []

            # Add diagram generation tool for all models
            tools.append(FunctionTool(func=generate_architecture_diagram))

            agent = Agent(
                name=f'assistant_{model_name.replace("-", "_").replace(".", "_")}',
                model=model_name,
                description=(
                    f'AI assistant using {model_config["display_name"]} - '
                    f'{model_config["description"]} with diagram generation'
                ),
                instruction=get_general_assistant_instructions(),
                tools=tools,
                after_tool_callback=store_tool_result_callback,
                after_model_callback=after_model_callback,
            )

            self._agent_cache[model_name] = agent
            _logger.info(f'Created new agent for model: {model_name}')

        return self._agent_cache[model_name]

    def get_available_models(self) -> Dict[str, Dict[str, Any]]:
        """Get list of available models with their configurations.

        Returns:
            Dictionary of model configurations.
        """
        return self._available_models.copy()

    def is_model_supported(self, model_name: str) -> bool:
        """Check if a model is supported.

        Args:
            model_name: The name of the model to check.

        Returns:
            True if the model is supported, False otherwise.
        """
        return model_name in self._available_models

    def get_default_model(self) -> str:
        """Get the default model name.

        Returns:
            The default model name.
        """
        return settings.DEFAULT_MODEL

    def clear_cache(self) -> None:
        """Clear the agent cache. Useful for testing or configuration updates."""
        self._agent_cache.clear()
        self.get_agent.cache_clear()
        _logger.info('Agent cache cleared')


# Singleton instance
agent_factory = AgentFactory()

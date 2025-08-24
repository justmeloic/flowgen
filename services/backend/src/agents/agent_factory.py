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

from functools import lru_cache
from typing import Any, Dict

from google.adk.agents import Agent
from google.adk.tools import FunctionTool
from loguru import logger as _logger

from .callbacks import before_model_callback, store_tool_result_callback
from .tools import generate_architecture_diagram

try:
    from src.lib.config import settings

    from .system_instructions import get_general_assistant_instructions
except ImportError:
    # Handle direct script execution (for quick testing)
    from system_instructions import get_general_assistant_instructions

    from src.lib.config import settings


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
                before_model_callback=before_model_callback,
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

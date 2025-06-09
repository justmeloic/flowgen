# Copyright 2025 Google LLC
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
"""Manages configuration and interaction with the Generative AI model.

This module provides functions to:
- Configure the Google Generative AI API with an API key.
- Retrieve a GenerativeModel instance.
- Create formatted prompts for Mermaid.js code generation.
- Generate Mermaid.js code using the model with a system prompt.
"""

from __future__ import annotations

# Standard library imports
import logging
import os
from typing import Any, Optional  # Used for safety_settings, consider more specific type

# Third-party imports
import google.generativeai as genai
from dotenv import load_dotenv

# Application-specific imports
from src.models.system_instructions import SYSTEM_INSTRUCTIONS

# Load environment variables once when the module is imported.
# This is primarily for development convenience to load GEMINI_API_KEY.
# In production, environment variables should be set directly.
load_dotenv()

_logger = logging.getLogger(__name__)


def create_gemini_prompt(message: str, engine: str = "mermaid") -> str:
    """Creates a prompt for the Gemini model for diagram generation.

    Args:
        message: The user's description of the architecture or diagram.
        engine: The diagram engine to use (e.g., "mermaid", "plantuml").

    Returns:
        A formatted prompt string instructing the model to generate diagram code.
    """
    base_prompt = (
        f"Please help create a {engine} diagram based on the following "
        f"description.\nUse {engine} syntax and wrap the response in a "
        f"markdown code block with the {engine} language identifier.\nOnly "
        f"respond with the diagram code, no explanations or additional text.\n\n"
        f"Description:\n{message}\n"
    )
    return base_prompt


def get_model(
    model_name: str = "gemini-2.5-flash-preview-05-20",  # Restored original default
    safety_settings: Optional[list[Any]] = None,
) -> genai.GenerativeModel:
    """Configures the Generative AI API and returns a GenerativeModel instance.

    Args:
        model_name: The name of the model to use.
        safety_settings: A list of safety setting objects to configure content
                         filtering for the model. Defaults to None.

    Returns:
        A configured `genai.GenerativeModel` instance.

    Raises:
        ValueError: If the `GEMINI_API_KEY` environment variable is not set.
        RuntimeError: If there's an error configuring the API or model.
    """
    model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash-preview-05-20")
    try:
        gemini_api_key = os.environ["GEMINI_API_KEY"]
        _logger.debug("GEMINI_API_KEY loaded successfully.")
    except KeyError as e:
        _logger.error("GEMINI_API_KEY environment variable must be set.")
        raise ValueError("GEMINI_API_KEY environment variable must be set.") from e

    try:
        genai.configure(api_key=gemini_api_key)
        model = genai.GenerativeModel(model_name=model_name, safety_settings=safety_settings)
        return model
    except Exception as e:
        _logger.exception('Error configuring or getting model "%s".', model_name)
        raise RuntimeError(f"Error configuring or getting model: {e}") from e


def generate_mermaid_with_system_prompt(
    model: genai.GenerativeModel,
    prompt: str,
    system_prompt: str = SYSTEM_INSTRUCTIONS,
) -> str:
    """Generates Mermaid code using the model with a specific system prompt.

    Args:
        model: The `genai.GenerativeModel` instance to use for generation.
        prompt: The user's prompt describing the desired diagram.
        system_prompt: The system instructions to guide the model's generation.
                       Defaults to `SYSTEM_INSTRUCTIONS`.

    Returns:
        The generated Mermaid code as a string.

    Raises:
        RuntimeError: If an error occurs during content generation.
    """
    try:
        contents = [
            genai.types.Content(role="user", parts=[genai.types.Part(text=system_prompt)]),
            genai.types.Content(role="user", parts=[genai.types.Part(text=prompt)]),
        ]
        response = model.generate_content(contents)
        if not response.parts:
            _logger.warning("Model response did not contain any parts.")
            return ""
        return response.text
    except Exception as e:
        _logger.exception("Error during content generation.")
        raise RuntimeError(f"Error during generation: {e}") from e


# Example usage and testing block
if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG)

    try:
        model_instance = get_model()  # Uses the default model_name from the function
        if model_instance:
            user_input_example = (
                "A client application sends a request to an API gateway. "
                "The gateway forwards the request to Service A or Service B. "
                "Both services access a database."
            )
            full_prompt_example = create_gemini_prompt(user_input_example)
            _logger.info("Generated Prompt:\n%s", full_prompt_example)

            generated_code = generate_mermaid_with_system_prompt(model_instance, full_prompt_example)
            _logger.info("\nGenerated Mermaid Code:\n%s", generated_code)

    except (ValueError, RuntimeError) as e:
        _logger.error("Main program caught an exception: %s", e)

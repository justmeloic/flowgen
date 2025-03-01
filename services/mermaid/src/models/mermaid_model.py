"""
Module for configuring and retrieving a Generative AI model instance for Mermaid.js generation.

This module provides functionality to configure the Google Generative AI API and
create a GenerativeModel instance specifically tailored for generating Mermaid.js
code from user-provided architectural descriptions. It leverages predefined system
instructions to guide the model's behavior and includes a utility function for
dynamically creating prompts.

The module handles API key configuration, model selection, and uses a system prompt
defined in the `system_instructions` module to ensure consistent and high-quality
Mermaid code generation.
"""

import os
import google.generativeai as genai
from dotenv import load_dotenv
from models.system_instructions import SYSTEM_INSTRUCTIONS

load_dotenv()


def create_gemini_prompt(user_description: str) -> str:
    """
    Generates a complete prompt for the Gemini LLM, optimized for Mermaid.js.

    Includes system instructions as a prefix to the user's input.
    """
    prompt = f"""{SYSTEM_INSTRUCTIONS}

{user_description}
    """.strip()
    return prompt


def get_model(api_key, model_name="gemini-2.0-flash", safety_settings=None):
    """
    Configures the Generative AI API and returns a GenerativeModel instance.

    Args:
        api_key: Your Google Cloud Generative AI API key.
        model_name: The name of the model to use (default: "gemini-2.0-flash").
        safety_settings: A list of SafetySetting objects to configure content filtering.

    Returns:
        A GenerativeModel instance.

    Raises:
        ValueError: if the API Key is not valid.
        RuntimeError: if the model configuration fails.
    """
    if not api_key:
        raise ValueError("API key is required.")
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(model_name)
        return model
    except Exception as e:
        raise RuntimeError(f"Error configuring or getting model: {e}") from e


def generate_mermaid_with_system_prompt(
    model: genai.GenerativeModel, prompt: str, system_prompt: str = SYSTEM_INSTRUCTIONS
) -> str:
    """
    Generates Mermaid code with a system prompt.

    Args:
        model: The GenerativeModel instance.
        prompt: The user prompt.
        system_prompt: The system prompt to apply.

    Returns:
        The generated Mermaid code.
    """
    try:
        response = model.generate_content(
            [
                genai.types.content_types.Content(role="user", parts=[system_prompt]),
                genai.types.content_types.Content(role="user", parts=[prompt]),
            ]
        )
        response.resolve()
        return response.text
    except Exception as e:
        raise RuntimeError(f"Error during generation: {e}") from e


# Example usage (and testing - good practice to keep this!)
if __name__ == "__main__":
    api_key = os.getenv("GEMINI_API_KEY")  # Replace with your actual API key

    try:
        model = get_model(api_key)
        if model:
            # Test the prompt creation
            user_input = "A client application sends a request to an API gateway. The gateway forwards the request to Service A or Service B. Both services access a database."
            full_prompt = create_gemini_prompt(user_input)
            print("Generated Prompt:\n", full_prompt)

            # response = model.generate_content(full_prompt)
            response_text = generate_mermaid_with_system_prompt(model, full_prompt)
            print("\nGenerated Mermaid Code:\n", response_text)

    except Exception as e:
        print(f"Main program caught an exception: {e}")

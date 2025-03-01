import pytest
from src.models.mermaid_model import create_gemini_prompt


def test_create_gemini_prompt():
    user_input = "A simple system with a client and a server."
    prompt = create_gemini_prompt(user_input)
    assert user_input in prompt  # Check if the user input is included
    assert "Mermaid.js" in prompt  # Check for key instructions
    assert "ONLY the Mermaid code block" in prompt

    # Test with an empty input
    empty_prompt = create_gemini_prompt("")
    assert empty_prompt  # should still work and contain base instructions.

    # Test with a more complex input:
    complex_input = "A client application sends a request to an API gateway. The gateway then forwards the request to either Service A or Service B, depending on the request type. Both Service A and Service B access the same database."
    complex_prompt = create_gemini_prompt(complex_input)
    assert complex_input in complex_prompt
    assert "Mermaid.js" in complex_prompt  # Check for key instructions
    assert "ONLY the Mermaid code block" in complex_prompt

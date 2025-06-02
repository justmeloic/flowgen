from typing import Optional
from pydantic import BaseModel, Field


# Pydantic model for request body
class MermaidRequest(BaseModel):
    """
    Represents a mermaid request with a message field and an optional conversation ID.

    Attributes:
        message: The message sent by the user.
        conversation_id: An optional unique ID to track the conversation.
    """

    message: str = Field(
        ...,
        description="The message content for the mermaid interaction.",
        min_length=1,
        json_schema_extra={"example": "Hello, how are you?"},
    )
    conversation_id: Optional[str] = Field(
        None,
        description="Unique identifier for the conversation. If not provided, a new conversation is started.",
        json_schema_extra={"example": "conv-1234-abcd-5678-efgh"},
    )


# Pydantic model for response body
class MermaidResponse(BaseModel):
    """
    Represents the response from the mermaid endpoint.

    Attributes:
        response: The generated response from the model.
        conversation_id: The unique ID of the conversation.
    """

    response: str = Field(..., description="The generated response from the mermaid model.")
    conversation_id: str = Field(..., description="Unique identifier for the conversation.")

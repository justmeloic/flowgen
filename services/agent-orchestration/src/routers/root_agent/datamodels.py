from pydantic import BaseModel, Field, field_validator


# Request model
class Query(BaseModel):
    """Query model for agent requests."""

    text: str = Field(..., min_length=1)

    @field_validator("text")
    @classmethod
    def text_must_not_be_empty(cls, v: str) -> str:
        """Validate that text is not empty or just whitespace."""
        if not v.strip():
            raise ValueError("Text must not be empty or just whitespace")
        return v.strip()


class AgentConfig(BaseModel):
    """Configuration for agent services."""

    app_name: str = Field(default="agent_app")
    user_id: str = Field(default="default_user")

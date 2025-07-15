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

"""Configuration module for the application."""

from typing import List

from pydantic import BaseModel, ConfigDict, field_validator
from pydantic_settings import BaseSettings


class ServerConfig(BaseModel):
    """Server configuration."""

    host: str
    port: int
    log_level: str


class ApiConfig(BaseModel):
    """API configuration."""

    title: str
    description: str
    version: str


class CorsConfig(BaseModel):
    """CORS configuration."""

    allow_origins: List[str]
    allow_credentials: bool
    allow_methods: List[str]
    allow_headers: List[str]
    expose_headers: List[str]


class ModelConfig(BaseModel):
    """Model configuration."""

    gemini_version: str


class Settings(BaseSettings):
    """Core application settings."""

    # Server settings
    HOST: str = '0.0.0.0'
    PORT: int = 8081
    LOG_LEVEL: str = 'INFO'
    DEBUG: bool = False
    ENVIRONMENT: str = 'development'

    # API settings
    API_TITLE: str = 'CBA Agent API'
    API_DESCRIPTION: str = 'API for interacting with the CBA information agent'
    API_VERSION: str = '1.0.0'

    # Frontend URL for CORS
    FRONTEND_URL: str = 'http://localhost:3000'

    # Google Cloud settings
    GOOGLE_CLOUD_PROJECT: str = ''
    GOOGLE_CLOUD_LOCATION: str = ''

    # Model settings
    GEMINI_MODEL: str = 'gemini-2.5-flash'

    # Authentication settings
    AUTH_SECRET: str
    SESSION_TIMEOUT_HOURS: int = 24

    model_config = ConfigDict(env_file='.env', case_sensitive=True, extra='ignore')

    @field_validator('LOG_LEVEL', mode='before')
    @classmethod
    def validate_log_level(cls, v: str) -> str:
        """Validate log level is one of the allowed values."""
        allowed_levels = ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL']
        if v.upper() not in allowed_levels:
            raise ValueError(f'LOG_LEVEL must be one of {allowed_levels}')
        return v.upper()

    @property
    def server(self) -> ServerConfig:
        """Get server configuration."""
        return ServerConfig(
            host=self.HOST,
            port=self.PORT,
            log_level=self.LOG_LEVEL,
        )

    @property
    def api(self) -> ApiConfig:
        """Get API configuration."""
        return ApiConfig(
            title=self.API_TITLE,
            description=self.API_DESCRIPTION,
            version=self.API_VERSION,
        )

    @property
    def cors(self) -> CorsConfig:
        """Get CORS configuration."""
        return CorsConfig(
            allow_origins=[
                self.FRONTEND_URL,
                'https://60c3-2607-fea8-760-8700-c84-fad6-ffc2-770f.ngrok-free.app',
            ],
            allow_credentials=True,
            allow_methods=['*'],
            allow_headers=['*', 'X-Session-ID'],
            expose_headers=['X-Session-ID'],
        )

    @property
    def model(self) -> ModelConfig:
        """Get model configuration."""
        return ModelConfig(
            gemini_version=self.GEMINI_MODEL,
        )


# Global settings instance
settings = Settings()

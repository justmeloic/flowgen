# Mermaid Service (Backend)

![versions](https://img.shields.io/badge/python-3.13-blue?logo=python)
[![codecov](https://codecov.io/gh/justmeloic/flowgen/graph/badge.svg?token=XZYQXJOMFV)](https://codecov.io/gh/justmeloic/flowgen)
![Static Badge](https://img.shields.io/badge/build-passing-brightgreen)
[![License](https://img.shields.io/badge/License-Apache%202.0-orange.svg)](https://opensource.org/licenses/Apache-2.0)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/justmeloic/From-First-Principles/issues)
[![GitHub issues](https://img.shields.io/github/issues/justmeloic/From-First-Principles)](https://github.com/justmeloic/From-First-Principles/issues)
[![GitHub stars](https://img.shields.io/github/stars/justmeloic/From-First-Principles)](https://github.com/justmeloic/From-First-Principles/stargazers)

Backend service for FlowGen. It's a FastAPI application that uses a Gemini language model to translate natural language descriptions into Mermaid.js code.

## Technology Stack

- **FastAPI:** Web framework.
- **Uvicorn:** ASGI server for running FastAPI.
- **Google Generative AI (Gemini):** Language model for generating Mermaid code.
- **Pydantic:** Data validation and settings management.
- **Redis (Optional):** For storing conversation history.
- **pytest:** Testing framework.
- **pre-commit:** For code quality and formatting checks.

## Author

**[Loïc Muhirwa](https://github.com/justmeloic/)**

## License

This project is licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). See the `LICENSE` file for details.

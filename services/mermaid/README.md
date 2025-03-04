# FlowGen Mermaid Service: AI-Powered Diagram Generator Backend

[![Python](https://img.shields.io/badge/python-3.11+-blue?logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?logo=google)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Codecov](https://codecov.io/gh/justmeloic/flowgen/graph/badge.svg?token=XZYQXJOMFV)](https://codecov.io/gh/justmeloic/flowgen)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/justmeloic/flowgen/actions)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/justmeloic/flowgen/issues)

This directory (`services/mermaid`) contains the backend service for FlowGen, an innovative tool that generates diagrams from natural language descriptions. This service is a core component of FlowGen, responsible for using AI to understand user input and generate corresponding Mermaid diagram code.

## 🌟 Key Features

- **AI-Powered Diagram Generation:** Leverages Google's Gemini AI to transform natural language descriptions into Mermaid diagrams.
- **Multiple Diagram Support:** Can generate various types of diagrams, including flowcharts, sequence diagrams, class diagrams, and more, thanks to the versatility of Mermaid.
- **File Upload Handling:** Processes uploaded files (e.g., `.txt`, `.md`) to enhance diagram generation.
- **RESTful API:** Provides a clean and easy-to-use REST API for communication with the frontend.
- **Distributed Monolith Architecture:** Designed to work seamlessly within FlowGen's distributed monolith architecture.
- **CORS Support:** Implements Cross-Origin Resource Sharing (CORS) to allow requests from the frontend.
- **Logging**: The service has been set up with a logging system.
- **API Documentation**: the api documentation is available.

## 🛠️ Technology Stack

The Mermaid Service is built with a robust and efficient technology stack:

- **Python 3.11+:** The core programming language, chosen for its versatility and extensive libraries.
- **FastAPI:** A modern, high-performance web framework for building APIs with Python.
- **Google Generative AI (Gemini):** A state-of-the-art AI model that powers the natural language understanding and diagram generation.
- **Uvicorn:** An ASGI server used to run the FastAPI application, ensuring high performance and concurrency.
- **python-dotenv:** for loading environment variable.
- **Pydantic**: for data validation.
- **Redis (optional):** it was initially used for session management, but it has been removed.

## ⚙️ Development

1.  **Prerequisites:**

    - Python 3.11+
    - pip (Python package installer)
    - An API key for Google's Gemini AI model.
    - (Optional) redis server.

2.  **Set Up Environment Variables:**

    - Create a `.env` file in the `services/mermaid` directory.
    - Add your Gemini API key to the `.env` file:

      ```
      GEMINI_API_KEY=your_api_key_here
      ```

    - You can optionally add the environment variable for redis:

      ```
      REDIS_HOST=your_redis_host_here #default is localhost
      REDIS_PORT=your_redis_port_here #default is 6379
      REDIS_DB=your_redis_db_here #default is 0
      ```

3.  **Install Dependencies:**

    ```bash
    pip install -r requirements.txt
    ```

4.  **Run the Application:**

    ```bash
    uvicorn src.main:app --reload
    ```

    This command starts the development server with hot reloading enabled. You can access the API documentation at `http://localhost:8080/docs`.

## 🧪 Testing

While specific test setup details aren't provided, here are general recommendations:

- **pytest:** Use `pytest` to write and run unit tests and integration tests.
- **Test Organization:** Create a `tests` directory within `services/mermaid` to organize your test files.
- **Test Coverage:** Aim for high test coverage to ensure the reliability of your code.
- **Mocking:** When testing your application, make sure to mock the call to the external model.

## 📄 License

This project is licensed under the [Apache License 2.0](https://opensource.org/licenses/Apache-2.0).

## 🧑‍💻 Author

**Loïc Muhirwa** ([@justmeloic](https://github.com/justmeloic/))

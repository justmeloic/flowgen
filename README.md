# FlowGen: AI-Powered Solution Architecture Generator

[![Python](https://img.shields.io/badge/python-3.13+-blue?logo=python)](https://www.python.org/)
[![Node.js](https://img.shields.io/badge/node-18.x-green?logo=node.js)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-Apache%202.0-orange.svg)](https://opensource.org/licenses/Apache-2.0)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/justmeloic/flowgen/issues)
[![GitHub issues](https://img.shields.io/github/issues/justmeloic/flowgen)](https://github.com/justmeloic/flowgen/issues)
[![GitHub stars](https://img.shields.io/github/stars/justmeloic/flowgen)](https://github.com/justmeloic/flowgen/stargazers)

FlowGen uses generative AI to create solution architecture diagrams from natural language input and existing documentation. It generates Mermaid diagrams to visualize these architectures. Furthermore, FlowGen can leverage these diagrams to produce Infrastructure-as-Code (IaC) in the form of Terraform scripts, suitable for deployment on Google Cloud Platform.

## 🌟 Key Features

- **AI-Driven Diagram Generation:** Effortlessly convert natural language text into a variety of visual diagrams.
- **Multiple Diagram Support:** Generate flowcharts, sequence diagrams, class diagrams, and more using the popular Mermaid syntax.
- **Intelligent File Processing:** Upload existing documentation files (e.g., text, Markdown) and let FlowGen analyze and diagram them.
- **Real-Time Diagram Preview:** See your diagrams update instantly as you refine your descriptions.
- **Versatile Export Options:** Download generated diagrams in various formats to fit your documentation needs.
- **Distributed Monolith Architecture:** Experience a robust and efficient system, optimized for both performance and maintainability.
- **User Friendly Interface**: easy to use and designed for all kind of user.
- **Engine selection**: choose the diagram engine that you want to use.

## 🏗️ System Architecture

FlowGen is built using a **distributed monolith** architecture, which offers the benefits of both monolithic and microservices architectures. This means the application is structured as a single deployable unit, but internally, it's composed of distinct, loosely coupled services that communicate with each other.

**Components:**

1.  **Web UI (Frontend):**
    - Provides the user interface for interacting with FlowGen.
    - Built with Next.js, TypeScript, Tailwind CSS, and Shadcn/ui.
    - Handles user input, file uploads, and real-time rendering of diagrams.
2.  **Mermaid Service (Backend):**
    - The core AI-powered engine that processes user input and generates Mermaid diagrams.
    - Built with Python, FastAPI, and Google's Gemini AI model.
    - Responsible for understanding natural language, extracting system structure, and generating Mermaid code.
3.  **Communication**
    - the front end communicate with the backend through a REST API.
4.  **Static File Server:**
    - Serves the static files for the web UI.
    - Integrated within the FastAPI application.
5.  **Mermaid library:** \* Used to render the mermaid diagram in the front end.
    **Benefits:**

- **Simplicity:** Easier to develop, deploy, and manage compared to a complex microservices architecture.
- **Performance:** Efficient communication between components due to being part of the same deployment unit.
- **Scalability:** Individual components can still be scaled separately if needed.
- **Maintainability:** Clear separation of concerns makes the codebase easier to understand and maintain.

## 🛠️ Technology Stack

FlowGen leverages a modern and powerful technology stack to provide a seamless user experience and efficient diagram generation:

**Frontend (Web UI - `services/webui`)**

- **Next.js 14:** A React framework for building performant web applications.
- **TypeScript:** Adds static typing to JavaScript for improved code quality and maintainability.
- **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
- **Shadcn/ui:** A collection of reusable, accessible UI components.
- **React Markdown**: for rendering markdown code.
- **Mermaid.js:** A library for rendering text-based diagrams as interactive graphics.

**Backend (Mermaid Service - `services/mermaid`)**

- **Python 3.13+:** A versatile programming language for building robust server-side applications.
- **FastAPI:** A modern, high-performance web framework for building APIs with Python.
- **Google Generative AI (Gemini):** A state-of-the-art AI model for natural language understanding and code generation.
- **Uvicorn:** An ASGI server used to run the FastAPI application.

## 🚀 Getting Started

Follow these steps to get FlowGen up and running on your local machine:

1.  **Prerequisites:**

    - **Python 3.13+**
    - **Node.js 18.x+**
    - **npm** (comes with Node.js)
    - **An API key for Google's Gemini AI model.**

2.  **Clone the Repository:**

    ```bash
    git clone <repository-url>
    cd flowgen
    ```

3.  **Set Up Environment Variables:**

    - Create a `.env` file in the `services/mermaid` directory.
    - Add your Gemini API key to the `.env` file:

      ```
      GEMINI_API_KEY=your_api_key_here
      ```

      - You can optionally set up these environment variables:

      ```
      REDIS_HOST=your_redis_host_here #default is localhost
      REDIS_PORT=your_redis_port_here #default is 6379
      REDIS_DB=your_redis_db_here #default is 0
      ```

4.  **Install Dependencies:**

    - Navigate to the backend directory and install the python dependencies:

      ```bash
      cd services/mermaid
      pip install -r requirements.txt
      ```

    - Navigate to the frontend directory and install the node dependencies:

      ```bash
      cd ../webui
      npm install
      ```

5.  **Run the Application:**

    - in `services/mermaid`:

      ```bash
      cd ../mermaid
      uvicorn src.main:app --reload
      ```

    - in `services/webui`:
      ```bash
      cd ../webui
      npm run dev
      ```
    - Open your web browser and go to `http://localhost:3000` to interact with FlowGen.
    - You can now go to `http://localhost:8080` to see the api documentation.

## 📄 License

This project is licensed under the [Apache License 2.0](https://opensource.org/licenses/Apache-2.0).

## 🧑‍💻 Author

**[Loïc Muhirwa](https://github.com/justmeloic/)**

---

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

## 🚀 Development Setup

This guide will help you set up your development environment for both frontend and backend components.

### Prerequisites

- **Python 3.13+**
- **Node.js 18.x+**
- **npm** or **yarn**
- **Docker** (optional, for containerized development)
- **Google Cloud CLI** (optional, for cloud deployment)
- **Gemini API key** (for AI features)

### Backend Development (FastAPI)

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/justmeloic/flowgen.git
   cd flowgen
   ```

2. **Set Up Python Environment:**
   ```bash
   cd services/mermaid
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your settings:
   ```properties
   GEMINI_API_KEY=your_api_key_here
   REDIS_HOST=localhost  # Optional
   REDIS_PORT=6379      # Optional
   REDIS_DB=0          # Optional
   ```

4. **Start Backend Server:**
   ```bash
   uvicorn src.main:app --reload --port 8080
   ```
   The API will be available at `http://localhost:8080`

### Frontend Development (Next.js)

1. **Navigate to Frontend Directory:**
   ```bash
   cd services/webui
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   The frontend will be available at `http://localhost:3000`

### Development Tools

- **API Documentation:** Available at `http://localhost:8080/docs`
- **Backend Hot Reload:** Enabled by default with `--reload` flag
- **Frontend Hot Reload:** Enabled by default in Next.js dev mode

### Using the Development Build Script

For convenience, you can use the build script in development mode:
```bash
./build-deploy.sh --local
```
This will:
- Build the frontend
- Copy static files to the backend
- Start the FastAPI server

### Testing

Run backend tests:
```bash
cd services/mermaid
pytest
```

Run frontend tests:
```bash
cd services/webui
npm test
```

## 📦 Deployment

FlowGen follows a distributed monolith architecture pattern, where the application is deployed as a single unit but maintains clear internal service boundaries. The build process compiles the Next.js frontend into static files that are served by the FastAPI backend, creating an efficient and easily deployable package.

### Architecture Overview

- **Frontend (Next.js)**: Compiled to static files during build
- **Backend (FastAPI)**: Serves both the API and static files
- **Deployment Model**: Single deployable unit with internal service separation

### Deployment Options

FlowGen provides three deployment methods using the `build-deploy.sh` script:

1. **Local Development** (`--local`)
   ```bash
   ./build-deploy.sh --local
   ```
   # or
   ```bash
   ./build-deploy.sh  # default option
   ```
   - Builds Next.js frontend into static files
   - Copies built files to FastAPI's static directory
   - Starts FastAPI server in development mode
   - Best for local development and testing

2. **Docker Compose** (`--docker`)
   ```bash
   ./build-deploy.sh --docker
   ```
   - Builds and runs the application using Docker Compose
   - Creates isolated environment with all dependencies
   - Suitable for development and testing in containerized environment
   - Eliminates "it works on my machine" problems

3. **Cloud Run Deployment** (`--cloud`)
   ```bash
   ./build-deploy.sh --cloud
   ```
   - Builds and deploys to Google Cloud Run
   - Requires proper GCP setup and permissions
   - Provides scalable, serverless deployment

### Cloud Run Deployment Prerequisites

1. Create a `.env` file in the root directory with the following configuration:
   ```properties
   PROJECT_ID=your-project-id
   REGION=your-region
   REPO_NAME=flowgen-repo
   SERVICE_NAME=flowgen-service
   IMAGE_NAME=flowgen
   IMAGE_TAG=latest
   SERVICE_ACCOUNT=your-service-account@your-project.iam.gserviceaccount.com
   ```

2. Set up service account permissions by running:
   ```bash
   ./service-account-permissions.sh
   ```
   This script grants necessary permissions for:
   - Artifact Registry access
   - Cloud Run deployment
   - Service account usage

3. Ensure you have:
   - Google Cloud CLI installed and configured
   - Docker installed and running
   - Authentication configured for Artifact Registry

### Build Process

The build process follows these steps:

1. **Frontend Build**
   - Compiles Next.js application
   - Optimizes assets
   - Generates static files

2. **Integration**
   - Copies static files to FastAPI's static directory
   - Configures serving paths

3. **Deployment**
   - Packages everything into a single deployable unit
   - Deploys according to chosen method

### Monitoring and Maintenance

- Local and Docker deployments can be monitored through standard logs
- Cloud Run deployments can be monitored through Google Cloud Console
- Logs are available through Cloud Logging when deployed to Cloud Run

## 📄 License

This project is licensed under the [Apache License 2.0](https://opensource.org/licenses/Apache-2.0).

## 🧑‍💻 Author

**[Loïc Muhirwa](https://github.com/justmeloic/)**

---

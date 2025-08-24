# Architecture Designer Frontend

![Next.js](https://img.shields.io/badge/next.js-14.0.0+-success.svg)
![React](https://img.shields.io/badge/react-18.0.0+-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.0.0+-3178C6.svg)
![Mermaid](https://img.shields.io/badge/Mermaid-Architecture%20Diagrams-FF6B6B.svg)

Interactive web interface for the Architecture Designer system. Built with Next.js for optimal performance and real-time diagram visualization.

## Interface

<div align="center">
  <img src="../../docs/interface.gif" alt="Interface Greeting" style="border-radius: 10px; max-width: 100%;">
</div>

<div align="center">
  <img src="../../docs/query-interface.gif" alt="Query Interface" style="border-radius: 10px; max-width: 100%;">
</div>

## Development Setup

### Prerequisites

- Node.js >= 18
- npm or yarn
- Google Cloud CLI

### Installation

```bash
make install
```

### Configuration

Configure environment variables:

```bash
# Copy the example environment file
cp src/.env.local.example src/.env.local

# Open the .env.local file and update the following variables:
# - NEXT_PUBLIC_API_BASE_URL=http://localhost:8000 (or where ever backend service is hosted)
```

### Running Development Server

```bash
make dev
```

The application will be available at `http://localhost:3000`

## Local Static Build for Testing

```bash
make build # This builds the static (pre-rendered into HTML, CSS, and JavaScript files) frontend into "out" and copies it over to the backend backend/build/static_frontend

cd ../backend/src/
make dev # Services backend with backend/build/static_frontend mounted
```

## Project Structure

```
frontend/
├── components/    # Reusable React components
├── pages/         # Next.js pages and API routes
├── public/        # Static assets
├── styles/        # Global styles and CSS modules
└── lib/          # Utility functions and configurations
```

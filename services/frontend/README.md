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

### Quick Start

```bash
# From project root - start both services
make dev

# Or run frontend only
make dev
```

### Configuration

The frontend automatically proxies API calls to the backend service at `http://localhost:8081` during development.

## Production Build

For production deployment, the frontend is built into static files that are served by the backend:

```bash
# Build static frontend for production
make build
```

This command:

1. Builds the Next.js app into static HTML/CSS/JS files
2. Copies the built files to `../backend/build/static_frontend/`
3. Backend serves both API and static frontend at port 8081

## Development vs Production

- **Development**: Frontend dev server at `:3000`, backend at `:8081`
- **Production**: Single backend service at `:8081` serving both API and static frontend

## Project Structure

```
frontend/
├── components/    # Reusable React components
├── pages/         # Next.js pages and API routes
├── public/        # Static assets
├── styles/        # Global styles and CSS modules
└── lib/          # Utility functions and configurations
```

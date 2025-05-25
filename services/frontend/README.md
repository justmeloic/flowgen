# Frontend Client Service

![Next.js](https://img.shields.io/badge/next.js-14.0.0+-success.svg)
![React](https://img.shields.io/badge/react-18.0.0+-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.0.0+-3178C6.svg)

Web interface for the CBA Agentic system. Built with Next.js for optimal performance and developer experience.

## Development Setup

### Prerequisites

- Node.js >= 18
- npm or yarn
- Google Cloud CLI

### Installation

```bash
npm install
```

### or

```bash
yarn install
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
npm run dev
```

### or

```bash
yarn dev
```

The application will be available at `http://localhost:3000`

## Building for Production

```bash
npm run build
npm run start
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

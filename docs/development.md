# Development Guide

This guide provides detailed instructions for setting up and developing AgentChat locally.

## Prerequisites

### System Requirements

- **Operating System**: macOS, Linux, or Windows with WSL2
- **Python**: 3.13+ (backend)
- **Node.js**: 18+ (frontend)
- **Google Cloud CLI**: Latest version
- **Git**: For version control

### Google Cloud Setup

1. **Create GCP Project**

   ```bash
   gcloud projects create agentchat-project
   gcloud config set project agentchat-project
   ```

2. **Enable Required APIs**

   ```bash
   gcloud services enable aiplatform.googleapis.com
   gcloud services enable storage.googleapis.com
   gcloud services enable logging.googleapis.com
   ```

3. **Set up Google Cloud Authentication**
   ```bash
   gcloud auth application-default login
   ```

## Backend Development

### Environment Setup

1. **Clone and Navigate**

   ```bash
   git clone <repository-url>
   cd agentchat/services/backend
   ```

2. **Install uv Package Manager**

   ```bash
   pip install uv
   ```

3. **Create Virtual Environment**

   ```bash
   uv venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

4. **Install Dependencies**

   ```bash
   uv sync
   ```

5. **Environment Configuration**

   ```bash
   cp .env.example .env
   ```

   Configure your `.env` file:

   ```bash
   # Google Cloud Configuration
   GOOGLE_CLOUD_PROJECT=your-project-id
   GOOGLE_CLOUD_LOCATION=us-central1
   GOOGLE_GENAI_USE_VERTEXAI=TRUE

   # Application Configuration
   FRONTEND_URL=http://localhost:3000

   # Optional: Google Custom Search
   GOOGLE_CSE_ID=your-cse-id
   CUSTOM_SEARCH_API_KEY=your-api-key
   ```

### Running the Backend

```bash
# Development server with auto-reload
uvicorn src.app.main:app --reload --host 0.0.0.0 --port 8000

# Or using the Python module
cd src
python -m app.main
```

The backend will be available at `http://localhost:8000`

### Backend API Documentation

Once running, visit:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Frontend Development

### Environment Setup

1. **Navigate to Frontend**

   ```bash
   cd agentchat/services/frontend
   ```

2. **Install Dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration**

   ```bash
   cp src/.env.local.example src/.env.local
   ```

   Configure your `.env.local` file:

   ```bash
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   ```

### Running the Frontend

```bash
# Development server
npm run dev
# or
yarn dev
```

The frontend will be available at `http://localhost:3000`

### Frontend Build Options

```bash
# Static build for production
npm run build-static

# Local build for testing with backend
npm run build-local

# Development build
npm run build
```

## Development Workflow

### 1. Independent Services (Recommended for Development)

Run frontend and backend separately for optimal development experience:

```bash
# Terminal 1: Backend
cd services/backend
uvicorn src.app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Frontend
cd services/frontend
npm run dev
```

### 2. Integrated Testing

Test the production deployment model locally:

```bash
# Build frontend static files
cd services/frontend
npm run build-local

# Run backend with integrated frontend
cd ../backend
uvicorn src.app.main:app --reload --host 0.0.0.0 --port 8000
```

Visit `http://localhost:8000` to see the integrated application.

## Code Structure

### Backend Architecture

```
services/backend/src/
├── agents/                    # Agent factory and configurations
│   ├── agent_factory.py     # Multi-model agent factory
│   ├── agent.py             # Base agent configuration
│   └── system_instructions.py # Agent prompts and instructions
├── app/
│   ├── api/v1/              # API routes
│   │   └── routes/
│   │       ├── agent.py     # Main agent endpoints
│   │       ├── files.py     # File handling endpoints
│   │       └── utility.py   # Utility endpoints
│   ├── core/                # Core configuration
│   │   ├── config.py        # Application settings
│   │   └── logging.py       # Logging configuration
│   ├── middleware/          # Custom middleware
│   │   └── session_middleware.py # Session management
│   ├── models/              # Data models
│   ├── schemas/             # Request/response schemas
│   ├── services/            # Business logic
│   │   └── agent_service.py # Agent orchestration
│   └── utils/              # Utilities
│       ├── dependencies.py  # Dependency injection
│       └── formatters.py    # Response formatting
└── main.py                 # Application entry point
```

### Frontend Architecture

```
services/frontend/src/
├── app/                      # Next.js app directory
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Main chat page
│   └── doc/                 # Documentation page
├── components/              # React components
│   ├── ui/                  # Base UI components
│   ├── chat-input.tsx       # Message input component
│   ├── model-selector.tsx   # Model selection component
│   ├── header.tsx           # Application header
│   └── sidebar.tsx          # Navigation sidebar
├── hooks/                   # Custom React hooks
│   ├── use-mobile.tsx       # Mobile detection
│   └── use-toast.ts         # Toast notifications
├── lib/                    # Utilities
│   ├── api.ts              # API client functions
│   ├── env.ts              # Environment configuration
│   └── utils.ts            # General utilities
└── types/                  # TypeScript type definitions
    └── index.ts            # Shared types
```

## Testing

### Backend Testing

```bash
cd services/backend

# Run all tests
python -m pytest

# Run with coverage
python -m pytest --cov=src

# Run specific test file
python -m pytest tests/test_agent_factory.py
```

### Frontend Testing

```bash
cd services/frontend

# Run Jest tests
npm run test

# Run with coverage
npm run test:coverage

# Run E2E tests (if configured)
npm run test:e2e
```

## Debugging

### Backend Debugging

1. **Enable Debug Logging**

   ```python
   # In src/app/core/config.py
   LOG_LEVEL = "DEBUG"
   ```

2. **Use Python Debugger**

   ```python
   import pdb; pdb.set_trace()
   ```

3. **IDE Debugging**
   Configure your IDE to run:
   ```bash
   uvicorn src.app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Debugging

1. **Browser DevTools**

   - Network tab for API calls
   - Console for JavaScript errors
   - React DevTools for component inspection

2. **Next.js Debugging**

   ```bash
   NODE_OPTIONS='--inspect' npm run dev
   ```

3. **API Call Debugging**
   Check `src/lib/api.ts` for API client implementation

## Common Issues

### Backend Issues

1. **Google Cloud Authentication**

   ```bash
   # Re-authenticate
   gcloud auth application-default login

   # Check current project
   gcloud config get-value project
   ```

2. **Port Already in Use**

   ```bash
   # Find and kill process using port 8000
   lsof -ti:8000 | xargs kill -9
   ```

3. **Dependency Issues**
   ```bash
   # Clear and reinstall
   rm -rf .venv
   uv venv
   uv sync
   ```

### Frontend Issues

1. **Node Modules Issues**

   ```bash
   # Clear and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Environment Variables**

   - Ensure `.env.local` exists
   - Check `NEXT_PUBLIC_API_BASE_URL` is correct
   - Restart development server after changes

3. **Build Issues**
   ```bash
   # Clear Next.js cache
   rm -rf .next out
   npm run build
   ```

## Performance Tips

### Backend Performance

1. **Enable ADK Caching**

   - Agent Factory uses LRU cache
   - Runners are cached per model
   - Session service manages memory efficiently

2. **Database Optimization** (if using database)
   - Use connection pooling
   - Implement query optimization
   - Consider caching frequently accessed data

### Frontend Performance

1. **Next.js Optimizations**

   - Use Next.js Image component
   - Implement code splitting
   - Enable static generation where possible

2. **React Optimizations**
   - Use React.memo for expensive components
   - Implement proper dependency arrays in useEffect
   - Avoid unnecessary re-renders

## Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests** for new functionality
5. **Run the test suite**
6. **Commit your changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
7. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
8. **Open a Pull Request**

## Next Steps

Once you have the development environment running:

1. **Explore the API** using the Swagger UI at `http://localhost:8000/docs`
2. **Test model switching** in the frontend interface
3. **Review the session management** to understand conversation continuity
4. **Examine the agent factory** to see how multiple models are managed
5. **Check the deployment scripts** in the `scripts/` directory

For production deployment, see the [Deployment Guide](deployment.md).

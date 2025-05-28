# Stage 1: Frontend Builder (Node.js)
#-------------------------------------------------------------------------------
FROM node:20-slim AS frontend-builder

LABEL stage="frontend-builder"

WORKDIR /app/frontend


COPY services/frontend/package.json services/frontend/package-lock.json* ./

# Install dependencies using npm ci for cleaner, faster builds with a lockfile
RUN npm ci

COPY services/frontend/ ./


# This should generate static files in the 'out' directory as per the next.config.mjs (export option)
RUN npm run build


# Stage 2: Backend (Python FastAPI)
#-------------------------------------------------------------------------------
FROM python:3.13-rc-slim AS backend

LABEL stage="backend-runtime"

WORKDIR /app

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8080

# ... (the variables from Dockerfile) ...
ENV GOOGLE_GENAI_USE_VERTEXAI="TRUE"
ENV GEMINI_MODEL="gemini-2.5-flash-preview-05-20"
ENV GOOGLE_CLOUD_PROJECT="technical-assets-loicmuhirwa"
ENV GOOGLE_CLOUD_LOCATION="us-central1"
ENV DATA_STORE_ID="cn-cba_1747357876332"
ENV SUMMARY_RESULT_COUNT="5"
ENV FRONTEND_URL="http://localhost:3000"

# Install uv (Python package manager)
RUN pip install --no-cache-dir "uv>=0.2.0" # Ensures uv 0.2.8 or newer is installed

# Copy files needed for agent-orchestration package build AND dependency sync
# Make sure to copy the agent-orchestration's README.md to the root of /app
COPY services/agent-orchestration/pyproject.toml \
    services/agent-orchestration/uv.lock* \
    services/agent-orchestration/README.md \
    ./

# Install Python dependencies using uv
# Use the correct --frozen flag and keep the fallback
RUN uv sync --no-dev --frozen || uv sync --no-dev

# Copy the backend application code (source from agent-orchestration service)
COPY services/agent-orchestration/src/ ./src/

# Copy the built static frontend assets from the frontend-builder stage
COPY --from=frontend-builder /app/frontend/out/ ./static_frontend/

EXPOSE 8080
CMD ["/app/.venv/bin/python", "-m", "uvicorn", "src.app:application", "--host", "0.0.0.0"]


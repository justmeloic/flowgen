# Stage 1: Frontend Builder (Node.js)
#-------------------------------------------------------------------------------
FROM node:20-slim AS frontend-builder

LABEL stage="frontend-builder"

WORKDIR /app/frontend

# Copy package.json and package-lock.json (or yarn.lock, pnpm-lock.yaml)
COPY services/frontend/package.json services/frontend/package-lock.json* ./

# Install dependencies using npm ci for cleaner, faster builds with a lockfile
# If your build scripts require devDependencies (common for Next.js), do not use --only=production
RUN npm ci

# Copy the rest of the frontend application code
# This includes source files, public assets, config files, etc.
COPY services/frontend/ ./

# Run the build command (e.g., 'next build && next export' or similar)
# This should generate static files in the 'out' directory as per your next.config.mjs
RUN npm run build
# After this, built static assets should be in /app/frontend/out/

# Stage 2: Backend (Python FastAPI)
#-------------------------------------------------------------------------------
FROM python:3.13-rc-slim AS backend

LABEL stage="backend-runtime"

WORKDIR /app

# Set environment variables
# PYTHONUNBUFFERED ensures that Python output is sent straight to terminal without being buffered first
ENV PYTHONUNBUFFERED=1
# PORT will be set by Cloud Run. Default to 8080 for local Docker runs.
ENV PORT=8080

# Application-specific environment variables (defaults)
# These can be overridden at deployment time by Cloud Run
ENV GOOGLE_GENAI_USE_VERTEXAI="TRUE"
ENV GEMINI_MODEL="gemini-2.5-flash-preview-05-20" 
ENV GOOGLE_CLOUD_PROJECT="technical-assets-loicmuhirwa" 
ENV GOOGLE_CLOUD_LOCATION="us-central1"  
ENV DATA_STORE_ID="cn-cba_1747357876332"
ENV SUMMARY_RESULT_COUNT="5"
ENV FRONTEND_URL="http://localhost:3000"

# Install uv (Python package manager)
# Using --no-cache-dir for pip is good practice in Docker to keep layers small.
RUN pip install --no-cache-dir uv

# Copy Python project dependency files (pyproject.toml and uv.lock)
# These are from your agent-orchestration service
COPY services/agent-orchestration/pyproject.toml services/agent-orchestration/uv.lock* ./

# Install Python dependencies using uv
# --system: Install packages into the system Python environment.
# --no-dev: Skip development dependencies.
# --frozen-lockfile: Use the exact versions from uv.lock.
# The fallback `|| uv sync --system --no-dev` can be useful if the lockfile isn't perfectly synced,
# but for CI/CD, you might prefer the build to fail if --frozen-lockfile fails.
RUN uv sync --system --no-dev --frozen-lockfile || uv sync --system --no-dev

# Copy the backend application code (source from agent-orchestration service)
# This places your Python 'src' directory into '/app/src/'
COPY services/agent-orchestration/src/ ./src/

# Copy the built static frontend assets from the frontend-builder stage
# The Python app (app.py in /app/src/) expects static files in /app/static_frontend/
# (calculated as os.path.join(Path(__file__).parent.parent, 'static_frontend'))
COPY --from=frontend-builder /app/frontend/out/ ./static_frontend/

# Expose the port the application will run on.
# This is for documentation; Cloud Run uses the PORT env variable.
EXPOSE 8080

# Command to run the FastAPI application using uv and Uvicorn
# - "uv run": Executes the application using uv.
# - "--host", "0.0.0.0": Binds to all available network interfaces.
# - "--port", "$PORT": Uses the port specified by the PORT environment variable (provided by Cloud Run).
# - "src.app:application": Points to the 'application' ASGI object in '/app/src/app.py'.
CMD ["uv", "run", "--host", "0.0.0.0", "--port", "$PORT", "src.app:application"]
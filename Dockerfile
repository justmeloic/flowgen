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
ENV GOOGLE_GENAI_USE_VERTEXAI="TRUE"
ENV GEMINI_MODEL="gemini-2.5-flash-preview-05-20"
ENV GOOGLE_CLOUD_PROJECT="technical-assets-loicmuhirwa"
ENV GOOGLE_CLOUD_LOCATION="us-central1"
ENV DATA_STORE_ID="cn-cba_1747357876332"
ENV SUMMARY_RESULT_COUNT="5"
ENV FRONTEND_URL="http://localhost:3000"

# --- Python Dependency Installation using pip ---

# Copy necessary files for installing dependencies and the local package
# 1. pyproject.toml (needed for 'pip install .')
# 2. README.md (if your pyproject.toml references it for the package build)
# 3. The newly generated requirements.txt
# 4. The source code of your application
COPY services/agent-orchestration/pyproject.toml ./pyproject.toml
COPY services/agent-orchestration/README.md ./README.md
COPY services/agent-orchestration/requirements.txt ./requirements.txt
COPY services/agent-orchestration/src/ ./src/

# Upgrade pip and install dependencies from requirements.txt
# These will be installed into the system Python's site-packages for this image
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r ./requirements.txt

# Install the local 'agent-orchestration' package itself (from /app)
# This will use the pyproject.toml and src/ directory already copied.
RUN pip install --no-cache-dir .

# --- End Python Dependency Installation ---

# Copy the built static frontend assets from the frontend-builder stage
COPY --from=frontend-builder /app/frontend/out/ ./static_frontend/

EXPOSE 8080 

# CMD to run the application.
# Use 'python' directly, as packages are installed in the image's main Python environment.
CMD ["sh", "-c", "exec python -m uvicorn src.app:application --host 0.0.0.0 --port \"$PORT\""]
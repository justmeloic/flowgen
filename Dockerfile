# Frontend builder stage
FROM node:20-slim AS frontend-builder

WORKDIR /app

# Copy package files
COPY services/webui/package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY services/webui .

# Build static files
RUN npm run build

# Backend stage
FROM python:3.13-rc-slim AS backend

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv and dependencies
RUN pip install --no-cache-dir --upgrade pip uv

# Copy and install requirements
COPY services/mermaid/requirements.txt .
RUN uv pip install --system --upgrade --no-cache -r requirements.txt

# Copy backend code
COPY services/mermaid/src ./src

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/out ./src/static

# --- Runtime Environment Variables (for Cloud Run) ---
# Define them here as ENV, but their *values* will come from Cloud Run.

ENV APP_ENV=development
ENV PORT=8080


# Set Python path
ENV PYTHONPATH=/app

EXPOSE 8080

CMD ["python", "-m", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8080"]












# Stage 1: Build the Next.js application
FROM node:20-slim AS frontend-builder
WORKDIR /app
COPY services/webui/package*.json ./
RUN npm install
COPY services/webui ./
RUN npm run build

# Stage 2: Final image with Python and static files
FROM python:3.13-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv
RUN curl -LsSf https://astral.sh/uv/install.sh | sh

# Copy Python application
COPY services/mermaid/src ./src
COPY services/mermaid/requirements.txt ./

# Install Python dependencies using uv
RUN /root/.cargo/bin/uv pip install --require-virtualenv -r requirements.txt

# Copy static files from frontend build
COPY --from=frontend-builder /app/out ./static

# Set environment variables
ENV PYTHONPATH=/app
ENV PORT=8080

# Expose port
EXPOSE 8080

# Run the application
CMD ["python", "src/main.py"]

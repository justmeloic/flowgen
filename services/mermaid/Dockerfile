FROM python:3.13-rc-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv properly
RUN pip install uv

# Copy only requirements first
COPY services/mermaid/requirements.txt .

# Install dependencies without requiring virtualenv
RUN uv pip install --system -r requirements.txt

# Copy the application code
COPY services/mermaid/src ./src

# Create necessary directories
RUN mkdir -p static

# Set Python path
ENV PYTHONPATH=/app

EXPOSE 8080

# Command to run the application
CMD ["python", "-m", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8080"]

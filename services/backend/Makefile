#Backend Makefile

.PHONY: dev prod deploy install clean test help

# Default target
dev:
	@echo "Starting development server..."
	source .venv/bin/activate && uvicorn src.app.main:app --reload --host 0.0.0.0 --port 8081

prod:
	@echo "Starting production server with ngrok tunnel..."
	./scripts/deploy.sh

deploy:
	@echo "Deploying to Google Cloud Run..."
	./scripts/deploy-gcloud.sh

install:
	@echo "Installing dependencies..."
	uv sync

test:
	@echo "Running tests..."
	source .venv/bin/activate && python -m pytest

test-verbose:
	@echo "Running tests with verbose output..."
	source .venv/bin/activate && python -m pytest -v

test-coverage:
	@echo "Running tests with coverage report..."
	source .venv/bin/activate && python -m pytest --cov=src --cov-report=term-missing

clean:
	@echo "Cleaning up..."
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete

help:
	@echo "Available commands:"
	@echo "  make dev              - Start development server"
	@echo "  make prod             - Start production server with ngrok tunnel (legacy)"
	@echo "  make deploy           - Deploy to Google Cloud Run"
	@echo "  make install          - Install dependencies"
	@echo "  make test             - Run tests"
	@echo "  make test-verbose     - Run tests with verbose output"
	@echo "  make test-coverage    - Run tests with coverage report"
	@echo "  make clean            - Clean Python cache files"
	@echo "  make help             - Show this help message"

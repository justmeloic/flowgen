#Backend Makefile

.PHONY: dev install clean help

# Default target
dev:
	@echo "Starting development server..."
	source .venv/bin/activate && uvicorn src.app.main:app --reload --host 0.0.0.0 --port 8081

install:
	@echo "Installing dependencies..."
	uv sync

clean:
	@echo "Cleaning up..."
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete

help:
	@echo "Available commands:"
	@echo "  make dev     - Start development server"
	@echo "  make install - Install dependencies"
	@echo "  make clean   - Clean Python cache files"
	@echo "  make help    - Show this help message"

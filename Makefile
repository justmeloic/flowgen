# Flowgen - AI-Powered Architecture Design
# Simplified build and development automation
#
# Usage:
#   make dev           - Start development servers for both frontend and backend
#   make build         - Build frontend static files and copy to backend
#   make deploy        - Build and deploy frontend to Netlify
#   make prod          - Deploy backend service with ngrok tunnel
#   make clean         - Clean build artifacts and cache files
#   make help          - Show this help message

.PHONY: dev build deploy prod clean help

# Default target
help:
	@echo "🚀 Flowgen - AI-Powered Architecture Design"
	@echo ""
	@echo "Available commands:"
	@echo "  make dev          🔧 Start development servers for both services"
	@echo "  make build        🏗️  Build frontend static files for production"
	@echo "  make deploy       🚀 Build and deploy frontend to Netlify"
	@echo "  make prod         🌐 Deploy backend service with ngrok tunnel"
	@echo "  make clean        🧹 Clean build artifacts and cache files"
	@echo "  make help         ❓ Show this help message"
	@echo ""
	@echo "🌐 Development URLs:"
	@echo "  Frontend:  http://localhost:3000"
	@echo "  Backend:   http://localhost:8081"
	@echo ""
	@echo "📦 Production:"
	@echo "  After 'make build', backend serves frontend at http://localhost:8081"

# Start development servers for both services
dev:
	@echo "🔧 Starting development servers..."
	@echo ""
	@echo "🎨 Frontend will be available at: http://localhost:3000"
	@echo "� Backend will be available at: http://localhost:8081"
	@echo ""
	@echo "Press Ctrl+C to stop both servers"
	@echo ""
	@$(MAKE) -j2 dev-frontend dev-backend

dev-frontend:
	@cd services/frontend && $(MAKE) dev

dev-backend:
	@cd services/backend && $(MAKE) dev

# Build frontend static files for production deployment
build:
	@echo "🏗️  Building frontend static files for production..."
	@cd services/frontend && $(MAKE) build
	@echo "✅ Frontend built and copied to backend"
	@echo "🚀 Backend now serves both API and frontend at port 8081"

# Deploy frontend to Netlify
deploy:
	@echo "🚀 Building and deploying frontend to Netlify..."
	@cd services/frontend && $(MAKE) build
	@echo "📦 Deploying to Netlify..."
	@cd services/frontend && netlify deploy --prod --dir=out
	@echo "✅ Deployment completed!"

# Deploy backend service with ngrok tunnel
prod:
	@echo "🌐 Deploying backend service with ngrok tunnel..."
	@cd services/backend && ./scripts/deploy.sh
	@echo "✅ Backend deployment started!"

# Clean build artifacts and cache files
clean:
	@echo "🧹 Cleaning build artifacts and cache files..."
	@echo "🗑️  Cleaning frontend artifacts..."
	@cd services/frontend && $(MAKE) clean
	@echo "🗑️  Cleaning backend artifacts..."  
	@cd services/backend && $(MAKE) clean
	@echo "🗑️  Cleaning built static frontend..."
	@rm -rf services/backend/build/static_frontend
	@echo "✅ Cleanup completed!"

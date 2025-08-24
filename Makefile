# Agent Interface Makefile
# Build and deployment automation
#
# Usage:
#   make build         - Build frontend static files
#   make deploy        - Deploy backend service with ngrok
#   make build-deploy  - Build frontend then deploy backend (recommended)
#   make all           - Same as build-deploy
#   make clean         - Stop all services and clean build artifacts
#   make status        - Show running screen sessions
#   make logs          - Show recent deployment logs
#   make restart       - Stop and redeploy services
#   make tunnel        - Start just ngrok tunnel
#   make stop          - Stop all running services
#   make help          - Show this help message

.PHONY: all build deploy build-deploy clean status logs restart tunnel stop help

# Default target
all: build-deploy

# Build frontend static files
build:
	@echo "🎨 Building frontend static files..."
	@bash scripts/build.sh

# Deploy backend service with ngrok
deploy:
	@echo "🚀 Deploying backend service..."
	@bash scripts/deploy.sh

# Build frontend then deploy backend (recommended workflow)
build-deploy: build deploy
	@echo "🎉 Build and deployment completed!"

# Clean up services and build artifacts
clean:
	@echo "🧹 Cleaning up services and build artifacts..."
	@echo "🛑 Stopping all screen sessions..."
	@-screen -S backend -X quit 2>/dev/null || true
	@-screen -S agent-interface-ngrok -X quit 2>/dev/null || true
	@echo "🗑️  Cleaning frontend build artifacts..."
	@-rm -rf services/frontend/.next services/frontend/out 2>/dev/null || true
	@echo "🗑️  Cleaning backend static frontend..."
	@-rm -rf services/backend/build/static_frontend 2>/dev/null || true
	@echo "🗑️  Cleaning Python cache files..."
	@-find services/backend -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@-find services/backend -name "*.pyc" -delete 2>/dev/null || true
	@echo "✅ Cleanup completed!"

# Show status of running services
status:
	@echo "📊 Service Status:"
	@echo ""
	@echo "📺 Screen Sessions:"
	@screen -list 2>/dev/null | grep -E "(backend|agent-interface-ngrok)" || echo "   No agent-interface sessions running"
	@echo ""
	@echo "🔌 Port Usage:"
	@echo "   Port 8081: $$(lsof -ti:8081 2>/dev/null && echo "IN USE" || echo "Available")"
	@echo ""
	@echo "🌐 Process Status:"
	@pgrep -f "uvicorn.*agent-interface" >/dev/null && echo "   ✅ Backend server running" || echo "   ❌ Backend server not running"
	@pgrep -f "ngrok.*8081" >/dev/null && echo "   ✅ Ngrok tunnel running" || echo "   ❌ Ngrok tunnel not running"

# Show recent deployment logs
logs:
	@echo "📋 Recent Deployment Logs:"
	@echo ""
	@if [ -d "logs" ]; then \
		LATEST_LOG=$$(ls -t logs/deploy_*.log 2>/dev/null | head -1); \
		if [ -n "$$LATEST_LOG" ]; then \
			echo "📄 Latest log: $$LATEST_LOG"; \
			echo ""; \
			tail -20 "$$LATEST_LOG"; \
		else \
			echo "No deployment logs found"; \
		fi; \
	else \
		echo "No logs directory found"; \
	fi

# Restart services (stop then deploy)
restart: stop deploy
	@echo "🔄 Services restarted!"

# Start just the ngrok tunnel (assumes backend is already running)
tunnel:
	@echo "🌐 Starting ngrok tunnel..."
	@if ! pgrep -f "uvicorn.*8081" >/dev/null; then \
		echo "❌ Backend server not running on port 8081"; \
		echo "💡 Run 'make deploy' or 'make build-deploy' first"; \
		exit 1; \
	fi
	@if command -v ngrok >/dev/null 2>&1; then \
		if [ -n "$$NGROK_AUTH_TOKEN" ] || [ -f ~/.config/ngrok/ngrok.yml ]; then \
			screen -dmS "agent-interface-ngrok" bash -c " \
				if [ -n '$$NGROK_AUTH_TOKEN' ]; then export NGROK_AUTHTOKEN='$$NGROK_AUTH_TOKEN'; fi; \
				echo '🚀 Starting Ngrok tunnel for agent-interface...'; \
				echo '🌍 Exposing http://localhost:8081 to the internet'; \
				ngrok http 8081 \
			"; \
			echo "✅ Ngrok tunnel started in screen session: agent-interface-ngrok"; \
			echo "🌍 Check tunnel URL with: screen -r agent-interface-ngrok"; \
		else \
			echo "❌ Ngrok not configured"; \
			echo "💡 Set NGROK_AUTH_TOKEN environment variable"; \
		fi; \
	else \
		echo "❌ Ngrok not installed"; \
	fi

# Stop all running services
stop:
	@echo "🛑 Stopping all services..."
	@-screen -S backend -X quit 2>/dev/null || true
	@-screen -S agent-interface-ngrok -X quit 2>/dev/null || true
	@-pkill -f "uvicorn.*agent-interface" 2>/dev/null || true
	@-pkill -f "ngrok.*8081" 2>/dev/null || true
	@echo "✅ All services stopped!"

# Show help
help:
	@echo "🚀 Agent Interface - Build & Deploy"
	@echo ""
	@echo "Available targets:"
	@echo "  build         🎨 Build frontend static files"
	@echo "  deploy        🚀 Deploy backend service with ngrok"
	@echo "  build-deploy  🏗️  Build frontend then deploy backend (recommended)"
	@echo "  all           📦 Same as build-deploy (default)"
	@echo "  clean         🧹 Stop services and clean build artifacts"
	@echo "  status        📊 Show running screen sessions and ports"
	@echo "  logs          📋 Show recent deployment logs"
	@echo "  restart       🔄 Stop and redeploy services"
	@echo "  tunnel        🌐 Start just ngrok tunnel (backend must be running)"
	@echo "  stop          🛑 Stop all running services"
	@echo "  help          ❓ Show this help message"
	@echo ""
	@echo "🌐 Access URLs (after deployment):"
	@echo "  Local:    http://localhost:8081"
	@echo "  Network:  http://0.0.0.0:8081"
	@echo "  Public:   Check ngrok session for URL"
	@echo ""
	@echo "📺 Screen Session Commands:"
	@echo "  screen -r backend              # Attach to backend server"
	@echo "  screen -r agent-interface-ngrok  # Attach to ngrok tunnel"
	@echo "  screen -list                   # List all sessions"
	@echo ""

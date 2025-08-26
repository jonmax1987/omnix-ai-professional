#!/bin/bash
# 🚀 OMNIX AI - Development Environment Startup
# Professional development server orchestration

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# PID tracking
BACKEND_PID=""
FRONTEND_PID=""
AI_SERVICE_PID=""

echo -e "${BLUE}🚀 OMNIX AI - Professional Development Environment${NC}"
echo -e "${BLUE}=================================================${NC}"
echo -e "${YELLOW}Project Root: $PROJECT_ROOT${NC}"
echo ""

# Cleanup function
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping development servers...${NC}"
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        echo -e "${YELLOW}⚙️ Backend server stopped${NC}"
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        echo -e "${YELLOW}🎨 Frontend server stopped${NC}"
    fi
    
    if [ ! -z "$AI_SERVICE_PID" ]; then
        kill $AI_SERVICE_PID 2>/dev/null || true
        echo -e "${YELLOW}🧠 AI service stopped${NC}"
    fi
    
    # Kill any remaining node processes for our project
    pkill -f "apps/backend" 2>/dev/null || true
    pkill -f "apps/frontend" 2>/dev/null || true
    
    echo -e "${GREEN}✅ All services stopped cleanly${NC}"
    exit 0
}

# Handle Ctrl+C
trap cleanup SIGINT SIGTERM

# Start Backend Server
echo -e "${BLUE}⚙️ Starting Backend Server...${NC}"
cd "$PROJECT_ROOT/apps/backend"

if [ -f "package.json" ]; then
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing backend dependencies...${NC}"
        npm install
    fi
    
    echo -e "${YELLOW}Starting NestJS backend...${NC}"
    npm run dev &
    BACKEND_PID=$!
    echo -e "${GREEN}✅ Backend server started (PID: $BACKEND_PID)${NC}"
else
    echo -e "${RED}❌ Backend package.json not found!${NC}"
fi

# Wait a moment for backend to initialize
sleep 2

# Start Frontend Server
echo -e "${BLUE}🎨 Starting Frontend Server...${NC}"
cd "$PROJECT_ROOT/apps/frontend"

if [ -f "package.json" ]; then
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing frontend dependencies...${NC}"
        npm install
    fi
    
    echo -e "${YELLOW}Starting Vite frontend...${NC}"
    npm run dev &
    FRONTEND_PID=$!
    echo -e "${GREEN}✅ Frontend server started (PID: $FRONTEND_PID)${NC}"
else
    echo -e "${RED}❌ Frontend package.json not found!${NC}"
fi

# Wait a moment for frontend to initialize
sleep 3

# Optional: Start AI Service (if Python is available)
echo -e "${BLUE}🧠 Starting AI Service...${NC}"
cd "$PROJECT_ROOT/apps/ai-service"

if command -v python3 &> /dev/null && [ -f "lambda_function.py" ]; then
    echo -e "${YELLOW}Starting Python AI service...${NC}"
    python3 lambda_function.py &
    AI_SERVICE_PID=$!
    echo -e "${GREEN}✅ AI service started (PID: $AI_SERVICE_PID)${NC}"
else
    echo -e "${YELLOW}⚠️ Python3 not available or AI service not found, skipping...${NC}"
fi

# Display service information
echo ""
echo -e "${GREEN}🎉 OMNIX AI Development Environment Ready!${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""
echo -e "${BLUE}🌐 Frontend Application:${NC}  http://localhost:5173"
echo -e "${BLUE}🔗 Backend API:${NC}          http://localhost:3000"
echo -e "${BLUE}📊 API Documentation:${NC}    http://localhost:3000/api"

if [ ! -z "$AI_SERVICE_PID" ]; then
    echo -e "${BLUE}🧠 AI Service:${NC}           http://localhost:8000"
fi

echo ""
echo -e "${YELLOW}📋 Service Status:${NC}"
echo -e "${GREEN}✅ Backend:${NC} Running (PID: ${BACKEND_PID:-'Not started'})"
echo -e "${GREEN}✅ Frontend:${NC} Running (PID: ${FRONTEND_PID:-'Not started'})"
echo -e "${GREEN}✅ AI Service:${NC} ${AI_SERVICE_PID:+Running (PID: $AI_SERVICE_PID)}${AI_SERVICE_PID:-Disabled}"

echo ""
echo -e "${BLUE}🔧 Development Tips:${NC}"
echo -e "${YELLOW}• Frontend auto-reloads on file changes${NC}"
echo -e "${YELLOW}• Backend auto-restarts with nodemon${NC}"
echo -e "${YELLOW}• Check browser console for any errors${NC}"
echo -e "${YELLOW}• API calls go through unified client${NC}"

echo ""
echo -e "${RED}Press Ctrl+C to stop all services${NC}"
echo ""

# Keep script running and wait for user interruption
while true; do
    sleep 1
    
    # Check if processes are still running
    if [ ! -z "$BACKEND_PID" ] && ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo -e "${RED}⚠️ Backend server stopped unexpectedly${NC}"
        BACKEND_PID=""
    fi
    
    if [ ! -z "$FRONTEND_PID" ] && ! kill -0 $FRONTEND_PID 2>/dev/null; then
        echo -e "${RED}⚠️ Frontend server stopped unexpectedly${NC}"
        FRONTEND_PID=""
    fi
    
    if [ ! -z "$AI_SERVICE_PID" ] && ! kill -0 $AI_SERVICE_PID 2>/dev/null; then
        echo -e "${RED}⚠️ AI service stopped unexpectedly${NC}"
        AI_SERVICE_PID=""
    fi
done
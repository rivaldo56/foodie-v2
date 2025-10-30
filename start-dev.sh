#!/bin/bash

# Foodie v2 - Development Startup Script
# Starts both Django backend and Next.js frontend

echo "🍽️  Starting Foodie v2 Development Environment..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${RED}❌ Virtual environment not found!${NC}"
    echo "Please run: python -m venv venv"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "foodie-frontend/node_modules" ]; then
    echo -e "${RED}❌ Frontend dependencies not installed!${NC}"
    echo "Please run: cd foodie-frontend && npm install"
    exit 1
fi

echo -e "${BLUE}📦 Activating Python virtual environment...${NC}"
source venv/bin/activate

echo -e "${BLUE}🔧 Running Django migrations...${NC}"
python manage.py migrate --noinput

echo -e "${GREEN}✅ Backend ready!${NC}"
echo ""

# Start Django backend in background
echo -e "${BLUE}🚀 Starting Django backend on http://127.0.0.1:8000${NC}"
python manage.py runserver > logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to start
sleep 3

# Start Next.js frontend in background
echo -e "${BLUE}🚀 Starting Next.js frontend on http://localhost:3000${NC}"
cd foodie-frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
echo "Frontend PID: $FRONTEND_PID"

echo ""
echo -e "${GREEN}✅ Both servers started successfully!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 Foodie v2 is now running!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "📍 Backend:  ${BLUE}http://127.0.0.1:8000${NC}"
echo -e "📍 Frontend: ${BLUE}http://localhost:3000${NC}"
echo -e "📍 Admin:    ${BLUE}http://127.0.0.1:8000/admin${NC}"
echo -e "📍 API Docs: ${BLUE}http://127.0.0.1:8000/swagger${NC}"
echo ""
echo "📝 Logs:"
echo "   Backend:  logs/backend.log"
echo "   Frontend: logs/frontend.log"
echo ""
echo "To stop servers:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "Or run: ./stop-dev.sh"
echo ""

# Save PIDs to file for stop script
echo "$BACKEND_PID" > .dev-backend.pid
echo "$FRONTEND_PID" > .dev-frontend.pid

# Keep script running and show logs
echo "Press Ctrl+C to stop watching logs (servers will continue running)"
echo ""
tail -f logs/backend.log logs/frontend.log

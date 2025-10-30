#!/bin/bash

# Foodie v2 - Stop Development Servers

echo "🛑 Stopping Foodie v2 Development Servers..."

# Read PIDs from files
if [ -f ".dev-backend.pid" ]; then
    BACKEND_PID=$(cat .dev-backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo "Stopping backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID
    fi
    rm .dev-backend.pid
fi

if [ -f ".dev-frontend.pid" ]; then
    FRONTEND_PID=$(cat .dev-frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo "Stopping frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
    fi
    rm .dev-frontend.pid
fi

# Fallback: kill by process name
pkill -f "manage.py runserver" 2>/dev/null
pkill -f "next dev" 2>/dev/null

echo "✅ All servers stopped!"

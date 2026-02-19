#!/bin/bash
# ==============================================================================
# init.sh - Project Initialization Script
# ==============================================================================
# Run this script at the start of every session to ensure the
# environment is properly set up and the development server is running.
# ==============================================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Initializing Data Ada Agent project...${NC}"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    cd data-ada-agent && npm install && cd ..
else
    echo "Dependencies already installed. Skipping npm install."
fi

# Check if dev server is already running
if lsof -ti:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Dev server already running at http://localhost:3000${NC}"
else
    # Start development server in background
    echo "Starting development server..."
    cd data-ada-agent
    npm run dev &
    SERVER_PID=$!
    cd ..

    # Wait for server to be ready
    echo "Waiting for server to start..."
    sleep 3

    echo -e "${GREEN}✓ Initialization complete!${NC}"
    echo -e "${GREEN}✓ Dev server running at http://localhost:3000 (PID: $SERVER_PID)${NC}"
fi

echo ""
echo "Ready to continue development."

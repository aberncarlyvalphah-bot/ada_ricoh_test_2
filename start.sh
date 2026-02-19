#!/bin/bash
# ==============================================================================
# start.sh - Quick Start Script
# ==============================================================================
# Quick start command for new development sessions

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================"
echo "  Data Ada Agent - Quick Start"
echo "========================================${NC}"
echo ""

# Check if dev server is running
if lsof -ti:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Dev server is already running"
    echo ""
    echo "Current tasks status:"
    echo ""
    # Count completed and remaining tasks
    COMPLETED=$(grep -c '"passes": true' task.json 2>/dev/null || echo "0")
    TOTAL=$(grep -c '"id":' task.json 2>/dev/null || echo "0")
    REMAINING=$((TOTAL - COMPLETED))

    echo -e "${GREEN}  ✓ Completed: $COMPLETED${NC}"
    echo -e "${YELLOW}  ⏳  Remaining: $REMAINING${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "  1. Start a new Claude Code session"
    echo "  2. Ask Claude to complete the next task"
    echo ""
    echo -e "${BLUE}View task list:${NC} cat task.json | grep -A 4 '"id": '
    echo ""
    echo -e "${BLUE}View progress:${NC} cat progress.txt"
else
    echo -e "${YELLOW}⚠ Dev server is not running${NC}"
    echo ""
    echo "Starting development environment..."
    echo ""
    ./init.sh
    echo ""
    echo -e "${GREEN}✓ Environment initialized!${NC}"
    echo ""
    echo -e "${BLUE}========================================"
    echo "  Ready to develop"
    echo "========================================${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "  1. Start a new Claude Code session"
    echo "  2. Ask Claude to read task.json and complete the next task"
    echo ""
    echo -e "${BLUE}For more information, see:${NC}"
    echo "  - CLAUDE.md - Detailed workflow instructions"
    echo "  - task.json - Complete task list"
    echo "  - DEV_TOOLS_README.md - Tools usage guide"
fi

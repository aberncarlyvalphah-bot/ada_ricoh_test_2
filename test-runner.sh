#!/bin/bash
# ==============================================================================
# test-runner.sh - Automated Testing Tool
# ==============================================================================
# This script runs automated tests for the Data Ada Agent project
# ==============================================================================

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "========================================"
echo "  Data Ada Agent - Test Runner"
echo "========================================"
echo ""

# Test 1: Check TypeScript compilation
echo -e "${BLUE}[1/5]${NC} Checking TypeScript compilation..."
if cd data-ada-agent && npx tsc --noEmit > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} TypeScript compilation: PASSED"
    TS_STATUS=0
else
    echo -e "${RED}✗${NC} TypeScript compilation: FAILED"
    TS_STATUS=1
fi
cd ..

# Test 2: Run ESLint
echo ""
echo -e "${BLUE}[2/5]${NC} Running ESLint..."
if cd data-ada-agent && npm run lint > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} ESLint: PASSED"
    LINT_STATUS=0
else
    echo -e "${RED}✗${NC} ESLint: FAILED"
    LINT_STATUS=1
fi
cd ..

# Test 3: Build the project
echo ""
echo -e "${BLUE}[3/5]${NC} Building project..."
if cd data-ada-agent && npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Build: PASSED"
    BUILD_STATUS=0
else
    echo -e "${RED}✗${NC} Build: FAILED"
    BUILD_STATUS=1
fi
cd ..

# Test 4: Check development server
echo ""
echo -e "${BLUE}[4/5]${NC} Checking development server..."
if lsof -ti:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Dev server: RUNNING (port 3000)"
    SERVER_STATUS=0
else
    echo -e "${YELLOW}⚠${NC} Dev server: NOT RUNNING"
    echo -e "${YELLOW}  Start with: ./init.sh${NC}"
    SERVER_STATUS=1
fi

# Test 5: Take screenshots
echo ""
echo -e "${BLUE}[5/5]${NC} Taking screenshots..."

# Screenshot paths
HOME_SCREENSHOT="screenshots/home-$(date +%Y%m%d_%H%M%S).png"
WORKBENCH_SCREENSHOT="screenshots/workbench-$(date +%Y%m%d_%H%M%S).png"

mkdir -p screenshots

# Take home page screenshot
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "  Capturing home page screenshot..."
    cat > /tmp/home-screenshot.js << 'EOF'
const puppeteer = require('puppeteer');
const path = require('path');

async function screenshot() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(resolve => setTimeout(resolve, 2000));
  const screenshotPath = path.join(__dirname, '$HOME_SCREENSHOT');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  await browser.close();
}
screenshot().catch(console.error);
EOF

    node /tmp/home-screenshot.js 2>/dev/null
    if [ -f "$HOME_SCREENSHOT" ]; then
        echo -e "${GREEN}✓${NC} Home screenshot: SAVED"
        SCREENSHOT_STATUS=0
    else
        echo -e "${RED}✗${NC} Home screenshot: FAILED"
        SCREENSHOT_STATUS=1
    fi
    rm -f /tmp/home-screenshot.js
else
    echo -e "${YELLOW}⚠${NC} Skipping screenshot (dev server not running)"
    SCREENSHOT_STATUS=1
fi

# Take workbench page screenshot
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "  Capturing workbench page screenshot..."
    node screenshot.js
    if [ -f "workbench-screenshot.png" ]; then
        cp workbench-screenshot.png "$WORKBENCH_SCREENSHOT"
        echo -e "${GREEN}✓${NC} Workbench screenshot: SAVED"
    else
        echo -e "${RED}✗${NC} Workbench screenshot: FAILED"
    fi
else
    echo -e "${YELLOW}⚠${NC} Skipping screenshot (dev server not running)"
fi

echo ""
echo "========================================"
echo "  Test Summary"
echo "========================================"

# Summary
TOTAL_TESTS=5
PASSED_TESTS=0
FAILED_TESTS=0

[ $TS_STATUS -eq 0 ] && ((PASSED_TESTS++)) || ((FAILED_TESTS++))
[ $LINT_STATUS -eq 0 ] && ((PASSED_TESTS++)) || ((FAILED_TESTS++))
[ $BUILD_STATUS -eq 0 ] && ((PASSED_TESTS++)) || ((FAILED_TESTS++))
[ $SERVER_STATUS -eq 0 ] && ((PASSED_TESTS++)) || ((FAILED_TESTS++))
[ $SCREENSHOT_STATUS -eq 0 ] && ((PASSED_TESTS++)) || ((FAILED_TESTS++))

echo ""
echo "Total tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $FAILED_TESTS${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed!${NC}"
    exit 1
fi

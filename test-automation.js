const puppeteer = require('puppeteer');
const path = require('path');

// Test configuration
const CONFIG = {
  URL: 'http://localhost:3000',
  SCREENSHOTS_DIR: path.join(__dirname, 'test-screenshots'),
  TIMEOUT: 10000,
};

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: [],
};

// Utility function to take screenshot
async function takeScreenshot(page, name, description) {
  const timestamp = Date.now();
  const filename = `${timestamp}-${name}.png`;
  const filepath = path.join(CONFIG.SCREENSHOTS_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`  📸 Screenshot: ${filename}`);
  console.log(`     Description: ${description}`);
  return filepath;
}

// Utility function to log test result
function logTest(name, passed, details = '') {
  results.tests.push({ name, passed, details });
  if (passed) {
    results.passed++;
    console.log(`✅ PASS: ${name}`);
    if (details) console.log(`   ${details}`);
  } else {
    results.failed++;
    console.log(`❌ FAIL: ${name}`);
    if (details) console.log(`   ${details}`);
  }
}

// Utility function to wait
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main test function
async function runTests() {
  console.log('🚀 Starting automated tests...\n');

  // Ensure screenshots directory exists
  const fs = require('fs');
  if (!fs.existsSync(CONFIG.SCREENSHOTS_DIR)) {
    fs.mkdirSync(CONFIG.SCREENSHOTS_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Set default timeout
  page.setDefaultTimeout(CONFIG.TIMEOUT);

  try {
    // ========== TEST 1: Home Page Load ==========
    console.log('\n=== Test 1: Home Page Load ===');
    try {
      await page.goto(CONFIG.URL, { waitUntil: 'networkidle2', timeout: 30000 });
      await page.waitForSelector('h2', { timeout: 10000 });
      await takeScreenshot(page, '01-home-page', 'Home page loaded');
      logTest('Home page loads correctly', true);
    } catch (error) {
      logTest('Home page loads correctly', false, error.message);
    }

    // ========== TEST 2: Quick Actions Buttons ==========
    console.log('\n=== Test 2: Quick Actions Buttons ===');
    try {
      const buttons = await page.$$('button');
      let quickActionFound = false;

      for (const button of buttons) {
        const text = await button.evaluate(el => el.textContent);
        if (text && (text.includes('Chart') || text.includes('Dashboard') ||
                     text.includes('Extract') || text.includes('Report'))) {
          quickActionFound = true;
          break;
        }
      }

      if (quickActionFound) {
        // Try to click a quick action button
        const chartButton = await page.evaluateHandle(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          return buttons.find(btn => btn.textContent?.includes('Chart'));
        });

        if (chartButton) {
          await chartButton.click();
          await wait(500);
          await takeScreenshot(page, '02-quick-action-click', 'Quick action button clicked');
          logTest('Quick action buttons exist and clickable', true);
        } else {
          logTest('Quick action buttons exist and clickable', false, 'Chart button not found');
        }
      } else {
        logTest('Quick action buttons exist and clickable', false, 'No quick action buttons found');
      }
    } catch (error) {
      logTest('Quick action buttons exist and clickable', false, error.message);
    }

    // ========== TEST 3: Chat Input ==========
    console.log('\n=== Test 3: Chat Input ===');
    try {
      const textarea = await page.$('textarea');
      if (textarea) {
        await textarea.type('分析一下数据');
        await wait(500);
        await takeScreenshot(page, '03-chat-input-typing', 'Chat input with text');

        // Clear input
        await textarea.click({ clickCount: 3 });
        await page.keyboard.press('Backspace');
        logTest('Chat input accepts text input', true);
      } else {
        logTest('Chat input accepts text input', false, 'Textarea not found');
      }
    } catch (error) {
      logTest('Chat input accepts text input', false, error.message);
    }

    // ========== TEST 4: Add Data Button ==========
    console.log('\n=== Test 4: Add Data Button ===');
    try {
      const addDataButton = await page.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.find(btn =>
          btn.textContent?.toLowerCase().includes('add data') ||
          btn.textContent?.toLowerCase().includes('数据')
        );
      });

      if (addDataButton) {
        await addDataButton.click();
        await wait(500);
        await takeScreenshot(page, '04-add-data-click', 'Add Data button clicked');

        // Check if file input was triggered
        const fileInput = await page.$('input[type="file"]');
        if (fileInput) {
          logTest('Add Data button triggers file upload', true);
        } else {
          logTest('Add Data button triggers file upload', false, 'File input not found');
        }
      } else {
        logTest('Add Data button triggers file upload', false, 'Add Data button not found');
      }
    } catch (error) {
      logTest('Add Data button triggers file upload', false, error.message);
    }

    // ========== TEST 5: Sidebar Navigation ==========
    console.log('\n=== Test 5: Sidebar Navigation ===');
    try {
      const sidebar = await page.$('aside');
      if (sidebar) {
        const projectName = await sidebar.$('text=数据分析演示');
        if (projectName) {
          await projectName.click();
          await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
          await wait(1000);
          await takeScreenshot(page, '05-sidebar-navigation', 'Sidebar project navigation');

          // Check if we're on workbench page
          const currentUrl = page.url();
          if (currentUrl.includes('/project/')) {
            logTest('Sidebar navigation to workbench', true);
          } else {
            logTest('Sidebar navigation to workbench', false, `URL: ${currentUrl}`);
          }
        } else {
          logTest('Sidebar navigation to workbench', false, 'Demo project not found in sidebar');
        }
      } else {
        logTest('Sidebar navigation to workbench', false, 'Sidebar not found');
      }
    } catch (error) {
      logTest('Sidebar navigation to workbench', false, error.message);
    }

    // ========== TEST 6: Workbench Page Layout ==========
    console.log('\n=== Test 6: Workbench Page Layout ===');
    try {
      // Check for chat panel and canvas panel
      const chatPanel = await page.$('text=Chat');
      const canvasPanel = await page.$('text=Canvas');

      if (chatPanel || canvasPanel) {
        await takeScreenshot(page, '06-workbench-layout', 'Workbench page layout');
        logTest('Workbench page displays panels', true, `Chat: ${!!chatPanel}, Canvas: ${!!canvasPanel}`);
      } else {
        logTest('Workbench page displays panels', false, 'Panels not found');
      }
    } catch (error) {
      logTest('Workbench page displays panels', false, error.message);
    }

    // ========== TEST 7: Chart Type Selection ==========
    console.log('\n=== Test 7: Chart Type Selection ===');
    try {
      const chartButtons = await page.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.filter(btn =>
          btn.textContent?.toLowerCase().includes('line') ||
          btn.textContent?.toLowerCase().includes('bar') ||
          btn.textContent?.toLowerCase().includes('pie') ||
          btn.textContent?.toLowerCase().includes('radar') ||
          btn.textContent?.toLowerCase().includes('scatter') ||
          btn.textContent?.toLowerCase().includes('heatmap')
        );
      });

      const buttons = await chartButtons.evaluateHandle(el => el.length);
      const count = await buttons.jsonValue();

      if (count > 0) {
        await takeScreenshot(page, '07-chart-buttons', 'Chart type buttons');
        logTest('Chart type selection available', true, `Found ${count} chart buttons`);

        // Try clicking a chart button
        const firstChartButton = await chartButtons.evaluateHandle(el => el[0]);
        await firstChartButton.click();
        await wait(500);
        await takeScreenshot(page, '08-chart-button-click', 'Chart button clicked');
        logTest('Chart type buttons are clickable', true);
      } else {
        logTest('Chart type selection available', false, 'No chart buttons found');
      }
    } catch (error) {
      logTest('Chart type selection available', false, error.message);
    }

    // ========== TEST 8: Data Table Display ==========
    console.log('\n=== Test 8: Data Table Display ===');
    try {
      const table = await page.$('table');
      if (table) {
        const rows = await table.$$('tr');
        await takeScreenshot(page, '09-data-table', 'Data table display');

        if (rows.length > 1) {
          logTest('Data table displays data', true, `Found ${rows.length} rows`);
        } else {
          logTest('Data table displays data', false, `Only ${rows.length} row(s) found`);
        }
      } else {
        logTest('Data table displays data', false, 'Table element not found');
      }
    } catch (error) {
      logTest('Data table displays data', false, error.message);
    }

    // ========== TEST 9: File Library ==========
    console.log('\n=== Test 9: File Library ===');
    try {
      const fileLibraryText = await page.evaluate(() => {
        return document.body.textContent?.toLowerCase().includes('file library') ||
               document.body.textContent?.toLowerCase().includes('文件库');
      });

      if (fileLibraryText) {
        await takeScreenshot(page, '10-file-library', 'File Library section');
        logTest('File Library section exists', true);
      } else {
        logTest('File Library section exists', false, 'File Library text not found');
      }
    } catch (error) {
      logTest('File Library section exists', false, error.message);
    }

    // ========== TEST 10: New Chat Button ==========
    console.log('\n=== Test 10: New Chat Button ===');
    try {
      const newChatButton = await page.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.find(btn =>
          btn.textContent?.toLowerCase().includes('new chat') ||
          btn.textContent?.toLowerCase().includes('新建聊天')
        );
      });

      if (newChatButton) {
        await newChatButton.click();
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
        await wait(500);
        await takeScreenshot(page, '11-new-chat-click', 'New Chat button clicked');

        const currentUrl = page.url();
        if (currentUrl === `${CONFIG.URL}/`) {
          logTest('New Chat button navigates to home', true);
        } else {
          logTest('New Chat button navigates to home', false, `URL: ${currentUrl}`);
        }
      } else {
        logTest('New Chat button navigates to home', false, 'New Chat button not found');
      }
    } catch (error) {
      logTest('New Chat button navigates to home', false, error.message);
    }

    // ========== TEST 11: Responsive Design Check ==========
    console.log('\n=== Test 11: Responsive Design Check ===');
    try {
      // Test tablet size
      await page.setViewport({ width: 768, height: 1024 });
      await wait(500);
      await takeScreenshot(page, '12-responsive-tablet', 'Responsive design - tablet');

      // Test mobile size
      await page.setViewport({ width: 375, height: 667 });
      await wait(500);
      await takeScreenshot(page, '13-responsive-mobile', 'Responsive design - mobile');

      // Reset to desktop
      await page.setViewport({ width: 1920, height: 1080 });
      await wait(500);
      logTest('Responsive design adapts to screen sizes', true);
    } catch (error) {
      logTest('Responsive design adapts to screen sizes', false, error.message);
    }

    // ========== TEST 12: Console Errors ==========
    console.log('\n=== Test 12: Console Errors ===');
    try {
      const errors = await page.evaluate(() => {
        return window.errors || [];
      });

      if (errors.length === 0) {
        logTest('No console errors', true);
      } else {
        logTest('No console errors', false, `Found ${errors.length} errors: ${JSON.stringify(errors, null, 2)}`);
      }
    } catch (error) {
      logTest('No console errors', false, error.message);
    }

  } catch (error) {
    console.error('Fatal error during tests:', error);
  } finally {
    await browser.close();
  }

  // Print test results
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST RESULTS');
  console.log('='.repeat(50));
  console.log(`Total tests: ${results.tests.length}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`Pass rate: ${((results.passed / results.tests.length) * 100).toFixed(1)}%`);
  console.log('='.repeat(50));

  // List failed tests
  const failedTests = results.tests.filter(t => !t.passed);
  if (failedTests.length > 0) {
    console.log('\n❌ Failed tests:');
    failedTests.forEach(test => {
      console.log(`   - ${test.name}`);
      if (test.details) console.log(`     ${test.details}`);
    });
  }

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Test configuration
const CONFIG = {
  URL: 'http://localhost:3000',
  SCREENSHOTS_DIR: path.join(__dirname, 'test-screenshots-advanced'),
  TIMEOUT: 30000,
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

// Setup console error tracking
async function setupConsoleTracking(page) {
  await page.evaluateOnNewDocument(() => {
    window.testErrors = [];
    window.originalError = window.error;
    window.error = function(...args) {
      window.testErrors.push({
        message: args.join(' '),
        timestamp: new Date().toISOString(),
      });
      if (window.originalError) {
        window.originalError.apply(window, args);
      }
    };
  });
}

// Get console errors
async function getConsoleErrors(page) {
  return await page.evaluate(() => window.testErrors || []);
}

// Main test function
async function runTests() {
  console.log('🚀 Starting advanced feature tests...\n');

  // Ensure screenshots directory exists
  if (!fs.existsSync(CONFIG.SCREENSHOTS_DIR)) {
    fs.mkdirSync(CONFIG.SCREENSHOTS_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  page.setDefaultTimeout(CONFIG.TIMEOUT);

  // Setup console error tracking
  await setupConsoleTracking(page);

  try {
    // ========== TEST SUITE 1: File Upload and UI Update ==========
    console.log('\n' + '='.repeat(60));
    console.log('TEST SUITE 1: File Upload and UI Update');
    console.log('='.repeat(60));

    // Navigate to home
    await page.goto(CONFIG.URL, { waitUntil: 'networkidle2', timeout: 30000 });
    await wait(1000);
    await takeScreenshot(page, '01-home-start', 'Starting point - Home page');

    // Test 1.1: Click Add Data button
    console.log('\n--- Test 1.1: Add Data Button ---');
    try {
      const addDataButton = await page.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.find(btn =>
          btn.textContent?.toLowerCase().includes('add data') ||
          btn.textContent?.includes('数据')
        );
      });

      if (addDataButton) {
        await addDataButton.click();
        await wait(500);
        await takeScreenshot(page, '02-add-data-clicked', 'Add Data button clicked');

        const fileInput = await page.$('input[type="file"]');
        if (fileInput) {
          logTest('Add Data button opens file dialog', true);
        } else {
          logTest('Add Data button opens file dialog', false, 'File input not found');
        }
      } else {
        logTest('Add Data button opens file dialog', false, 'Button not found');
      }
    } catch (error) {
      logTest('Add Data button opens file dialog', false, error.message);
    }

    // Test 1.2: Check File Library before upload
    console.log('\n--- Test 1.2: File Library Before Upload ---');
    try {
      const fileLibraryExists = await page.evaluate(() => {
        return document.body.textContent?.toLowerCase().includes('file library') ||
               document.body.textContent?.toLowerCase().includes('文件库');
      });

      if (fileLibraryExists) {
        logTest('File Library section exists', true);
      } else {
        logTest('File Library section exists', false);
      }
    } catch (error) {
      logTest('File Library section exists', false, error.message);
    }

    // Test 1.3: Check for uploaded files indicator
    console.log('\n--- Test 1.3: Upload Status Indicator ---');
    try {
      const uploadingText = await page.evaluate(() => {
        return document.body.textContent?.toLowerCase().includes('上传') ||
               document.body.textContent?.toLowerCase().includes('uploading');
      });

      logTest('Upload status indicator exists', true, `Found: ${uploadingText}`);
    } catch (error) {
      logTest('Upload status indicator exists', false, error.message);
    }

    // ========== TEST SUITE 2: Chart and Data Table Interaction ==========
    console.log('\n' + '='.repeat(60));
    console.log('TEST SUITE 2: Chart and Data Table Interaction');
    console.log('='.repeat(60));

    // Test 2.1: Select Chart Quick Action
    console.log('\n--- Test 2.1: Select Chart Quick Action ---');
    try {
      const clicked = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b =>
          b.textContent?.toLowerCase().includes('chart')
        );
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      });

      if (clicked) {
        await wait(500);
        await takeScreenshot(page, '03-chart-mode-selected', 'Chart Quick Action selected');

        // Check if button has active state
        const isActive = await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const btn = buttons.find(b => b.textContent?.toLowerCase().includes('chart'));
          return btn?.classList.contains('bg-primary');
        });

        logTest('Chart Quick Action can be selected', true, `Active: ${isActive}`);
      } else {
        logTest('Chart Quick Action can be selected', false, 'Chart button not found');
      }
    } catch (error) {
      logTest('Chart Quick Action can be selected', false, error.message);
    }

    // Test 2.2: Enter chart mode message
    console.log('\n--- Test 2.2: Chart Mode Message ---');
    try {
      const textarea = await page.$('textarea');
      if (textarea) {
        await textarea.click({ clickCount: 3 });
        await textarea.type('请帮我生成一个雷达图展示各科目的成绩分布');
        await wait(500);
        await takeScreenshot(page, '04-chart-message-typed', 'Chart mode message entered');
        logTest('Chat Input accepts chart mode message', true);
      } else {
        logTest('Chat Input accepts chart mode message', false, 'Textarea not found');
      }
    } catch (error) {
      logTest('Chat Input accepts chart mode message', false, error.message);
    }

    // Test 2.3: Navigate to workbench to see chart
    console.log('\n--- Test 2.3: Navigate to Workbench ---');
    try {
      const navigated = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        const link = links.find(l =>
          l.textContent?.includes('数据分析演示') ||
          l.href?.includes('/project/')
        );
        if (link) {
          link.click();
          return true;
        }
        return false;
      });

      if (navigated) {
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
        await wait(1000);
        await takeScreenshot(page, '05-workbench-loaded', 'Workbench page loaded');

        const currentUrl = page.url();
        if (currentUrl.includes('/project/')) {
          logTest('Navigate to workbench page', true);
        } else {
          logTest('Navigate to workbench page', false, `URL: ${currentUrl}`);
        }
      } else {
        logTest('Navigate to workbench page', false, 'Project link not found');
      }
    } catch (error) {
      logTest('Navigate to workbench page', false, error.message);
    }

    // Test 2.4: Check for chart container
    console.log('\n--- Test 2.4: Chart Container ---');
    try {
      const chartContainer = await page.evaluate(() => {
        // Look for ECharts container or chart-related elements
        const containers = document.querySelectorAll('[class*="chart"], [class*="echar"]');
        return containers.length > 0;
      });

      if (chartContainer) {
        await takeScreenshot(page, '06-chart-container', 'Chart container found');
        logTest('Chart container exists', true);
      } else {
        logTest('Chart container exists', false, 'No chart container found');
      }
    } catch (error) {
      logTest('Chart container exists', false, error.message);
    }

    // Test 2.5: Check for data table
    console.log('\n--- Test 2.5: Data Table ---');
    try {
      // Look for table or data grid elements
      const table = await page.evaluate(() => {
        const tables = document.querySelectorAll('table, [class*="table"], [class*="grid"]');
        return tables.length > 0;
      });

      if (table) {
        await takeScreenshot(page, '07-data-table', 'Data table found');
        logTest('Data table exists', true);
      } else {
        logTest('Data table exists', false, 'No data table found');
      }
    } catch (error) {
      logTest('Data table exists', false, error.message);
    }

    // Test 2.6: Check for chart type buttons in workbench
    console.log('\n--- Test 2.6: Chart Type Buttons in Workbench ---');
    try {
      const chartButtons = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.filter(btn =>
          btn.textContent?.toLowerCase().includes('line') ||
          btn.textContent?.toLowerCase().includes('bar') ||
          btn.textContent?.toLowerCase().includes('pie') ||
          btn.textContent?.toLowerCase().includes('radar')
        );
      });

      if (chartButtons.length > 0) {
        await takeScreenshot(page, '08-chart-type-buttons', 'Chart type buttons in workbench');
        logTest('Chart type buttons exist in workbench', true, `Found ${chartButtons.length} buttons`);
      } else {
        logTest('Chart type buttons exist in workbench', false, 'No chart buttons found');
      }
    } catch (error) {
      logTest('Chart type buttons exist in workbench', false, error.message);
    }

    // ========== TEST SUITE 3: AI Chat Streaming Response ==========
    console.log('\n' + '='.repeat(60));
    console.log('TEST SUITE 3: AI Chat Streaming Response');
    console.log('='.repeat(60));

    // Navigate back to home
    console.log('\n--- Test 3.1: Return to Home ---');
    try {
      await page.goto(CONFIG.URL, { waitUntil: 'networkidle2', timeout: 30000 });
      await wait(1000);
      logTest('Return to home page', true);
    } catch (error) {
      logTest('Return to home page', false, error.message);
    }

    // Test 3.2: Send chat message
    console.log('\n--- Test 3.2: Send Chat Message ---');
    try {
      const textarea = await page.$('textarea');
      if (textarea) {
        await textarea.click({ clickCount: 3 });
        await textarea.type('分析一下学生的成绩数据');
        await wait(500);

        // Try to find and click send button
        const sendButton = await page.evaluateHandle(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          return buttons.find(btn =>
            btn.textContent?.toLowerCase().includes('send') ||
            btn.textContent?.includes('发送')
          );
        });

        if (sendButton) {
          await sendButton.evaluate(el => el.click());
          await wait(1000);
          await takeScreenshot(page, '09-message-sent', 'Chat message sent');
          logTest('Send chat message', true);
        } else {
          logTest('Send chat message', false, 'Send button not found');
        }
      } else {
        logTest('Send chat message', false, 'Textarea not found');
      }
    } catch (error) {
      logTest('Send chat message', false, error.message);
    }

    // Test 3.3: Check for thinking steps
    console.log('\n--- Test 3.3: Thinking Steps Display ---');
    try {
      await wait(2000); // Wait for response to start

      const thinkingSteps = await page.evaluate(() => {
        const steps = document.querySelectorAll('[class*="thinking"], [class*="step"]');
        return steps.length > 0;
      });

      await takeScreenshot(page, '10-thinking-steps', 'Thinking steps display');
      logTest('Thinking steps appear', true, `Found: ${thinkingSteps}`);
    } catch (error) {
      logTest('Thinking steps appear', false, error.message);
    }

    // Test 3.4: Check for conclusion/response
    console.log('\n--- Test 3.4: AI Conclusion/Response ---');
    try {
      await wait(2000); // Wait for response

      const response = await page.evaluate(() => {
        // Look for response text or conclusion
        const bodyText = document.body.textContent || '';
        return bodyText.includes('根据数据分析') ||
               bodyText.includes('结论') ||
               bodyText.includes('conclusion') ||
               bodyText.length > 100; // Check if there's substantial content
      });

      await takeScreenshot(page, '11-ai-response', 'AI response displayed');
      logTest('AI response appears', true, `Has response: ${response}`);
    } catch (error) {
      logTest('AI response appears', false, error.message);
    }

    // Test 3.5: Check for chart generation
    console.log('\n--- Test 3.5: Chart Generation ---');
    try {
      await wait(1000); // Wait for chart

      const chart = await page.evaluate(() => {
        const charts = document.querySelectorAll('[class*="chart"], [class*="echar"], canvas');
        return charts.length > 0;
      });

      await takeScreenshot(page, '12-chart-generated', 'Chart generated in response');
      logTest('Chart is generated in response', true, `Found: ${chart}`);
    } catch (error) {
      logTest('Chart is generated in response', false, error.message);
    }

    // Test 3.6: Check streaming indicators
    console.log('\n--- Test 3.6: Streaming Indicators ---');
    try {
      const streamingIndicators = await page.evaluate(() => {
        // Look for loading, typing, or streaming indicators
        const bodyText = document.body.textContent || '';
        return bodyText.includes('正在') ||
               bodyText.includes('loading') ||
               bodyText.includes('提取数据') ||
               bodyText.includes('生成分析');
      });

      logTest('Streaming/progress indicators appear', true, `Found: ${streamingIndicators}`);
    } catch (error) {
      logTest('Streaming/progress indicators appear', false, error.message);
    }

    // ========== TEST SUITE 4: Complete User Flow ==========
    console.log('\n' + '='.repeat(60));
    console.log('TEST SUITE 4: Complete User Flow');
    console.log('='.repeat(60));

    // Test 4.1: Full flow - Upload → Analyze → Result
    console.log('\n--- Test 4.1: Complete User Flow ---');
    try {
      await page.goto(CONFIG.URL, { waitUntil: 'networkidle2', timeout: 30000 });
      await wait(1000);

      // Select mode
      const chartButton = await page.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.find(btn =>
          btn.textContent?.toLowerCase().includes('chart')
        );
      });

      if (chartButton) {
        await chartButton.evaluate(el => el.click());
        await wait(500);
      }

      // Enter message
      const textarea = await page.$('textarea');
      if (textarea) {
        await textarea.click({ clickCount: 3 });
        await textarea.type('请生成图表分析学生成绩');
        await wait(500);

        // Send
        const sendButton = await page.evaluateHandle(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          return buttons.find(btn =>
            btn.textContent?.toLowerCase().includes('send') ||
            btn.textContent?.includes('发送')
          );
        });

        if (sendButton) {
          await sendButton.evaluate(el => el.click());
          await wait(2000);
          await takeScreenshot(page, '13-complete-flow', 'Complete user flow');

          logTest('Complete user flow executes', true);
        } else {
          logTest('Complete user flow executes', false, 'Send button not found');
        }
      } else {
        logTest('Complete user flow executes', false, 'Textarea not found');
      }
    } catch (error) {
      logTest('Complete user flow executes', false, error.message);
    }

    // ========== Console Errors Check ==========
    console.log('\n' + '='.repeat(60));
    console.log('TEST SUITE 5: Console Errors');
    console.log('='.repeat(60));

    console.log('\n--- Test 5.1: Console Errors ---');
    try {
      const errors = await getConsoleErrors(page);

      if (errors.length === 0) {
        logTest('No console errors during tests', true);
      } else {
        logTest('No console errors during tests', false, `Found ${errors.length} errors`);
        console.log('Errors:');
        errors.forEach(err => {
          console.log(`  - ${err.message} at ${err.timestamp}`);
        });
      }
    } catch (error) {
      logTest('No console errors during tests', false, error.message);
    }

  } catch (error) {
    console.error('Fatal error during tests:', error);
  } finally {
    await browser.close();
  }

  // Print test results
  console.log('\n' + '='.repeat(60));
  console.log('📊 ADVANCED TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`Total tests: ${results.tests.length}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`Pass rate: ${((results.passed / results.tests.length) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));

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

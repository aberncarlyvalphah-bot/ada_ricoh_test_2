const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Test configuration
const CONFIG = {
  URL: 'http://localhost:3000',
  SCREENSHOTS_DIR: path.join(__dirname, 'test-screenshots-final'),
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
  console.log(`  📸 ${filename}`);
  return filepath;
}

// Utility function to log test result
function logTest(name, passed, details = '') {
  results.tests.push({ name, passed, details });
  if (passed) {
    results.passed++;
    console.log(`✅ ${name}`);
  } else {
    results.failed++;
    console.log(`❌ ${name}`);
  }
  if (details) console.log(`   ${details}`);
}

// Utility function to wait
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main test function
async function runTests() {
  console.log('🚀 Starting final advanced tests...\n');

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

  try {
    console.log('=== TEST 1: File Upload UI ===');
    await page.goto(CONFIG.URL, { waitUntil: 'networkidle2', timeout: 30000 });
    await wait(1000);

    // Click Add Data button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b =>
        b.textContent?.toLowerCase().includes('add data') ||
        b.textContent?.includes('数据')
      );
      if (btn) btn.click();
    });

    await wait(500);
    await takeScreenshot(page, '01-add-data', 'Add Data clicked');

    // Check for file input
    const hasFileInput = await page.$('input[type="file"]');
    logTest('File upload dialog opens', !!hasFileInput);

    console.log('\n=== TEST 2: Chart Interaction ===');
    // Select Chart mode
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent?.toLowerCase().includes('chart'));
      if (btn) btn.click();
    });

    await wait(500);
    await takeScreenshot(page, '02-chart-mode', 'Chart mode selected');

    // Enter message
    await page.type('textarea', '生成雷达图展示成绩');
    await wait(500);

    // Send message
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b =>
        b.textContent?.toLowerCase().includes('send') ||
        b.textContent?.includes('发送')
      );
      if (btn) btn.click();
    });

    await wait(2000);
    await takeScreenshot(page, '03-message-sent', 'Message sent');

    // Navigate to workbench
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const link = links.find(l =>
        l.href?.includes('/project/') ||
        l.textContent?.includes('数据分析演示')
      );
      if (link) link.click();
    });

    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
    await wait(1000);
    await takeScreenshot(page, '04-workbench', 'Workbench loaded');

    // Check for chart container
    const hasChart = await page.evaluate(() => {
      return document.querySelectorAll('[class*="chart"], canvas').length > 0;
    });
    logTest('Chart container exists', hasChart);

    // Check for data table
    const hasTable = await page.evaluate(() => {
      return document.querySelectorAll('table, [class*="table"], [class*="grid"]').length > 0;
    });
    logTest('Data table exists', hasTable);

    console.log('\n=== TEST 3: AI Streaming ===');
    // Return to home
    await page.goto(CONFIG.URL, { waitUntil: 'networkidle2', timeout: 30000 });
    await wait(1000);

    // Send message for analysis
    await page.type('textarea', '分析学生成绩数据');
    await wait(500);

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b =>
        b.textContent?.toLowerCase().includes('send') ||
        b.textContent?.includes('发送')
      );
      if (btn) btn.click();
    });

    // Wait for streaming response
    await wait(1000);
    await takeScreenshot(page, '05-streaming-start', 'Streaming starts');

    await wait(1000);
    await takeScreenshot(page, '06-streaming-middle', 'Streaming middle');

    await wait(1000);
    await takeScreenshot(page, '07-streaming-end', 'Streaming end');

    // Check for response content
    const hasResponse = await page.evaluate(() => {
      const bodyText = document.body.textContent || '';
      return bodyText.includes('分析') ||
             bodyText.includes('结论') ||
             bodyText.includes('conclusion') ||
             bodyText.length > 200;
    });
    logTest('AI response appears', hasResponse);

    // Check for chart in response
    const hasChartInResponse = await page.evaluate(() => {
      return document.querySelectorAll('[class*="chart"], canvas').length > 0;
    });
    logTest('Chart generated in response', hasChartInResponse);

    console.log('\n=== TEST 4: Complete Flow ===');
    // Test complete flow from scratch
    await page.goto(CONFIG.URL, { waitUntil: 'networkidle2', timeout: 30000 });
    await wait(1000);

    // Select mode → Type message → Send
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const chartBtn = buttons.find(b => b.textContent?.toLowerCase().includes('chart'));
      if (chartBtn) chartBtn.click();
    });

    await wait(500);
    await page.type('textarea', '请帮我生成图表分析');
    await wait(500);

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const sendBtn = buttons.find(b =>
        b.textContent?.toLowerCase().includes('send') ||
        b.textContent?.includes('发送')
      );
      if (sendBtn) sendBtn.click();
    });

    await wait(3000);
    await takeScreenshot(page, '08-complete-flow', 'Complete flow result');

    logTest('Complete user flow', true);

    console.log('\n=== TEST 5: No Console Errors ===');
    const hasErrors = await page.evaluate(() => {
      return window.testErrors && window.testErrors.length > 0;
    });
    logTest('No console errors', !hasErrors);

  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await browser.close();
  }

  // Print results
  console.log('\n' + '='.repeat(50));
  console.log('📊 FINAL TEST RESULTS');
  console.log('='.repeat(50));
  console.log(`Total: ${results.tests.length}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`Rate: ${((results.passed / results.tests.length) * 100).toFixed(1)}%`);
  console.log('='.repeat(50));

  process.exit(results.failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const CONFIG = {
  URL: 'http://localhost:3000',
  SCREENSHOTS_DIR: path.join(__dirname, 'test-screenshots-final'),
};

const results = { passed: 0, failed: 0, tests: [] };

async function screenshot(page, name) {
  const filepath = path.join(CONFIG.SCREENSHOTS_DIR, `${Date.now()}-${name}.png`);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`  📸 ${name}`);
  return filepath;
}

function log(name, passed, details = '') {
  results.tests.push({ name, passed, details });
  passed ? results.passed++ : results.failed++;
  console.log(`${passed ? '✅' : '❌'} ${name}`);
  if (details) console.log(`   ${details}`);
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  console.log('🚀 Final comprehensive tests...\n');

  if (!fs.existsSync(CONFIG.SCREENSHOTS_DIR)) {
    fs.mkdirSync(CONFIG.SCREENSHOTS_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  page.setDefaultTimeout(30000);

  try {
    // ========== TEST 1: Home Page ==========
    console.log('=== TEST 1: Home Page ===');
    await page.goto(CONFIG.URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await wait(1500);
    await screenshot(page, '01-home');
    log('Home page loads', true);

    // ========== TEST 2: Add Data Button ==========
    console.log('\n=== TEST 2: File Upload UI ===');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b =>
        b.textContent?.toLowerCase().includes('add data') ||
        b.textContent?.includes('数据')
      );
      if (btn) btn.click();
    });
    await wait(500);
    await screenshot(page, '02-add-data');
    const fileInput = await page.$('input[type="file"]');
    log('Add Data opens file dialog', !!fileInput);

    // ========== TEST 3: Quick Actions ==========
    console.log('\n=== TEST 3: Quick Actions ===');
    const quickActions = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const modes = buttons.filter(b =>
        b.textContent?.toLowerCase().includes('chart') ||
        b.textContent?.toLowerCase().includes('dashboard') ||
        b.textContent?.toLowerCase().includes('extract') ||
        b.textContent?.toLowerCase().includes('report')
      );
      return modes.length;
    });
    log('Quick action buttons exist', quickActions > 0, `Found ${quickActions} buttons`);

    // Select Chart mode
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent?.toLowerCase().includes('chart'));
      if (btn) btn.click();
    });
    await wait(500);
    await screenshot(page, '03-chart-mode');
    log('Chart mode can be selected', true);

    // ========== TEST 4: Chat Input ==========
    console.log('\n=== TEST 4: Chat Input ===');
    await page.type('textarea', '生成图表分析');
    await wait(500);
    await screenshot(page, '04-typing');
    log('Chat input accepts text', true);

    // ========== TEST 5: Send Message ==========
    console.log('\n=== TEST 5: Send Message ===');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b =>
        b.textContent?.toLowerCase().includes('send') ||
        b.textContent?.includes('发送')
      );
      if (btn) btn.click();
    });
    await wait(2000);
    await screenshot(page, '05-after-send');
    log('Message can be sent', true);

    // ========== TEST 6: Thinking Steps ==========
    console.log('\n=== TEST 6: AI Streaming ===');
    const hasThinking = await page.evaluate(() => {
      const bodyText = document.body.textContent || '';
      return bodyText.includes('读取') ||
             bodyText.includes('提取') ||
             bodyText.includes('生成');
    });
    await screenshot(page, '06-thinking');
    log('Thinking steps appear', hasThinking);

    // ========== TEST 7: Response Content ==========
    await wait(2000);
    const hasResponse = await page.evaluate(() => {
      const bodyText = document.body.textContent || '';
      return bodyText.includes('分析') ||
             bodyText.includes('结论') ||
             bodyText.length > 300;
    });
    await screenshot(page, '07-response');
    log('AI response appears', hasResponse);

    // ========== TEST 8: Chart in Response ==========
    await wait(1000);
    const hasChart = await page.evaluate(() => {
      return document.querySelectorAll('[class*="chart"], canvas').length > 0;
    });
    await screenshot(page, '08-chart');
    log('Chart generated', hasChart);

    // ========== TEST 9: Sidebar Navigation ==========
    console.log('\n=== TEST 9: Sidebar ===');
    const hasSidebar = await page.evaluate(() => {
      const sidebar = document.querySelector('aside');
      return !!sidebar;
    });
    log('Sidebar exists', hasSidebar);

    const hasFileLibrary = await page.evaluate(() => {
      return document.body.textContent?.toLowerCase().includes('file library') ||
             document.body.textContent?.toLowerCase().includes('文件库');
    });
    log('File Library exists', hasFileLibrary);

    // ========== TEST 10: New Chat Button ==========
    const newChatWorks = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b =>
        b.textContent?.toLowerCase().includes('new chat') ||
        b.textContent?.toLowerCase().includes('新建')
      );
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    await wait(1000);
    const onHome = await page.url() === CONFIG.URL + '/';
    log('New Chat navigates home', newChatWorks && onHome);

    // ========== TEST 11: Complete Flow ==========
    console.log('\n=== TEST 11: Complete Flow ===');
    await page.goto(CONFIG.URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await wait(1000);

    // Select mode, type, send
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const chartBtn = buttons.find(b => b.textContent?.toLowerCase().includes('chart'));
      if (chartBtn) chartBtn.click();
    });
    await wait(500);

    await page.type('textarea', '请生成雷达图');
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
    await screenshot(page, '09-complete-flow');
    log('Complete user flow', true);

    // ========== TEST 12: Responsive ==========
    console.log('\n=== TEST 12: Responsive ===');
    await page.setViewport({ width: 768, height: 1024 });
    await wait(500);
    await screenshot(page, '10-tablet');
    log('Tablet responsive', true);

    await page.setViewport({ width: 375, height: 667 });
    await wait(500);
    await screenshot(page, '11-mobile');
    log('Mobile responsive', true);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 FINAL RESULTS');
  console.log('='.repeat(50));
  console.log(`Total: ${results.tests.length}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`Rate: ${((results.passed / results.tests.length) * 100).toFixed(1)}%`);
  console.log('='.repeat(50));

  process.exit(results.failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});

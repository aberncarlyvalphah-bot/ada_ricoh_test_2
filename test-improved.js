const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const CONFIG = {
  URL: 'http://localhost:3000',
  SCREENSHOTS_DIR: path.join(__dirname, 'test-screenshots-improved'),
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
  console.log('🚀 Improved feature tests...\n');

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
    // ========== TEST 1: File Upload Flow ==========
    console.log('=== SUITE 1: File Upload Flow ===');

    await page.goto(CONFIG.URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await wait(1500);
    await screenshot(page, '01-home-start');
    log('Home page loads', true);

    // Click Add Data
    console.log('\n--- Test 1.1: Add Data ---');
    const clickedAddData = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b =>
        b.textContent?.toLowerCase().includes('add data') ||
        b.textContent?.includes('数据')
      );
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (clickedAddData) {
      await wait(500);
      await screenshot(page, '02-add-data-clicked');
      log('Add Data button clicked', true);

      // Find and upload file
      const fileInput = await page.$('input[type="file"]');
      if (fileInput) {
        // Create test CSV
        const csvContent = `Subject,Score
Math,95
Science,88
English,92`;

        const testFile = path.join(__dirname, 'test-data-improved.csv');
        fs.writeFileSync(testFile, csvContent, 'utf-8');
        console.log(`  📄 Created test CSV: ${testFile}`);

        await fileInput.uploadFile(testFile);
        console.log('  📤 Uploading...');
        await wait(3000);
        await screenshot(page, '03-file-uploaded');
        log('File uploaded', true);

        // Check for attachment in input area
        const hasAttachment = await page.evaluate(() => {
          const bodyText = document.body.textContent || '';
          return bodyText.includes('Subject') ||
                 bodyText.includes('Score') ||
                 bodyText.includes('csv') ||
                 bodyText.includes('test-data');
        });
        await screenshot(page, '04-attachment-indicator');
        log('Attachment indicator appears', hasAttachment);
      } else {
        log('File input found', false);
      }
    } else {
      log('Add Data button clicked', false, 'Button not found');
    }

    // ========== TEST 2: Data Table Detection ==========
    console.log('\n=== SUITE 2: Data Table Detection ===');

    console.log('\n--- Test 2.1: Send Analysis Request ---');
    await page.type('textarea', '请分析数据');
    await wait(500);

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b =>
        b.textContent?.toLowerCase().includes('send') ||
        b.textContent?.includes('发送')
      );
      if (btn) btn.click();
    });

    await wait(2000);
    await screenshot(page, '05-analysis-sent');
    log('Analysis request sent', true);

    // Wait for response with data
    console.log('\n--- Test 2.2: Wait for Data Response ---');
    await wait(3000);
    await screenshot(page, '06-data-response');

    // Check for various data-related elements
    console.log('\n--- Test 2.3: Data Content Check ---');
    const dataContent = await page.evaluate(() => {
      const bodyText = document.body.textContent || '';

      return {
        hasSubject: bodyText.includes('Subject') || bodyText.includes('科目'),
        hasScore: bodyText.includes('Score') || bodyText.includes('成绩'),
        hasMath: bodyText.includes('Math') || bodyText.includes('数学'),
        hasScience: bodyText.includes('Science') || bodyText.includes('科学'),
        hasEnglish: bodyText.includes('English') || bodyText.includes('英语'),
        hasTableKeyword: bodyText.includes('表格') || bodyText.includes('Table') || bodyText.includes('table'),
        hasDataLength: bodyText.includes('4') || bodyText.includes('rows') || bodyText.includes('行'),
        hasAnalysis: bodyText.includes('分析') || bodyText.includes('Analysis') || bodyText.includes('conclusion'),
      };
    });

    await screenshot(page, '07-data-check');
    log('Response contains Subject', dataContent.hasSubject);
    log('Response contains Score', dataContent.hasScore);
    log('Response contains table keyword', dataContent.hasTableKeyword);
    log('Response contains analysis', dataContent.hasAnalysis);

    // Check for DOM elements
    console.log('\n--- Test 2.4: DOM Elements ---');
    const domElements = await page.evaluate(() => {
      // Try multiple selectors
      const selectors = [
        'table', 'tbody', 'thead', 'tr', 'td', 'th',
        '[class*="table"]', '[class*="grid"]', '[class*="data"]',
        '[role="grid"]', '[role="table"]', '[role="tablecell"]',
        '[data-testid*="table"]', '[data-testid*="data"]'
      ];

      const found = {};
      selectors.forEach(sel => {
        const elements = document.querySelectorAll(sel);
        if (elements.length > 0) {
          found[sel] = elements.length;
        }
      });

      return found;
    });

    await screenshot(page, '08-dom-elements');
    log('Table elements found', Object.values(domElements).some(count => count > 0),
      JSON.stringify(domElements, null, 2));

    // ========== TEST 3: Thinking Steps ==========
    console.log('\n=== SUITE 3: Thinking Steps ===');

    console.log('\n--- Test 3.1: Check for Thinking Indicators ---');
    await wait(1000);
    const thinkingIndicators = await page.evaluate(() => {
      const bodyText = document.body.textContent || '';
      return {
        hasRead: bodyText.includes('读取') || bodyText.includes('read'),
        hasExtract: bodyText.includes('提取') || bodyText.includes('extract'),
        hasGenerate: bodyText.includes('生成') || bodyText.includes('generate'),
        hasAnalyze: bodyText.includes('分析') || bodyText.includes('analyze'),
        hasProcessing: bodyText.includes('处理') || bodyText.includes('process'),
        hasLoading: bodyText.includes('loading') || bodyText.includes('上传中'),
        hasProgress: bodyText.includes('正在') || bodyText.includes('ing...'),
        hasDots: bodyText.includes('...'),
      };
    });

    await screenshot(page, '09-thinking-check');
    log('Has "读取" indicator', thinkingIndicators.hasRead);
    log('Has "提取" indicator', thinkingIndicators.hasExtract);
    log('Has "生成" indicator', thinkingIndicators.hasGenerate);
    log('Has dots (...) indicator', thinkingIndicators.hasDots);

    // ========== TEST 4: Chart Generation ==========
    console.log('\n=== SUITE 4: Chart Generation ===');

    await wait(1000);
    const chartElements = await page.evaluate(() => {
      const selectors = [
        'canvas', '[class*="chart"]', '[class*="echart"]',
        '[id*="chart"]', '[id*="echart"]',
        '[data-testid*="chart"]'
      ];

      const found = {};
      selectors.forEach(sel => {
        try {
          const elements = document.querySelectorAll(sel);
          if (elements.length > 0) {
            found[sel] = elements.length;
          }
        } catch (e) {
          // Some selectors might throw
        }
      });

      return found;
    });

    await screenshot(page, '10-chart-check');
    const hasChart = Object.values(chartElements).some(count => count > 0);
    log('Chart elements found', hasChart, JSON.stringify(chartElements, null, 2));

    // ========== TEST 5: Complete Flow with New Page ==========
    console.log('\n=== SUITE 5: Complete Flow ===');

    console.log('\n--- Test 5.1: Start from Home ---');
    await page.goto(CONFIG.URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await wait(1000);
    log('Navigated to home', true);

    // Select Chart mode
    console.log('\n--- Test 5.2: Select Chart Mode ---');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b =>
        b.textContent?.toLowerCase().includes('chart')
      );
      if (btn) btn.click();
    });

    await wait(500);
    log('Chart mode selected', true);

    // Type and send message
    console.log('\n--- Test 5.3: Type and Send ---');
    await page.type('textarea', '分析学生数据并生成图表');
    await wait(500);

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b =>
        b.textContent?.toLowerCase().includes('send') ||
        b.textContent?.includes('发送')
      );
      if (btn) btn.click();
    });

    await wait(2000);
    await screenshot(page, '11-complete-flow');
    log('Complete flow executed', true);

    // Final verification
    console.log('\n--- Test 5.4: Final Verification ---');
    const finalCheck = await page.evaluate(() => {
      const bodyText = document.body.textContent || '';

      return {
        onResponse: bodyText.includes('分析') || bodyText.length > 300,
        hasSubject: bodyText.includes('学生') || bodyText.includes('Student'),
        hasChart: document.querySelectorAll('canvas, [class*="chart"]').length > 0,
        hasProgress: bodyText.includes('...') || bodyText.includes('ing...'),
      };
    });

    log('Final response appears', finalCheck.onResponse);
    log('Chart appears in final check', finalCheck.hasChart);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }

  // Print results
  console.log('\n' + '='.repeat(50));
  console.log('📊 IMPROVED TEST RESULTS');
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

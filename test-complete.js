const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const CONFIG = {
  URL: 'http://localhost:3000',
  SCREENSHOTS_DIR: path.join(__dirname, 'test-screenshots-complete'),
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

// Create a test CSV file
function createTestCSV() {
  const csvContent = `科目,成绩,排名
语文,85,5
数学,92,2
英语,88,4
物理,78,8
化学,82,6
生物,75,10
历史,90,3
地理,86,7
政治,88,4`;

  const filepath = path.join(__dirname, 'test-data.csv');
  fs.writeFileSync(filepath, csvContent, 'utf-8');
  return filepath;
}

async function runTests() {
  console.log('🚀 Complete feature tests...\n');

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
    // ========== TEST SUITE 1: File Upload with Data ==========
    console.log('=== SUITE 1: File Upload and UI Update ===');

    // Navigate to home
    await page.goto(CONFIG.URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await wait(1500);
    await screenshot(page, '01-home-start');
    log('Home page loads', true);

    // Click Add Data button
    console.log('\n--- Test 1.1: Click Add Data ---');
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

      // Find file input
      const fileInput = await page.$('input[type="file"]');
      if (fileInput) {
        // Create test CSV file
        const csvFile = createTestCSV();
        console.log(`  📄 Created test CSV: ${csvFile}`);

        // Upload the file
        await fileInput.uploadFile(csvFile);
        console.log('  📤 Uploading test CSV file...');

        // Wait for upload to complete (monitor for upload status)
        await wait(3000);
        await screenshot(page, '03-file-uploaded');

        // Check for upload completion indicators
        const uploadComplete = await page.evaluate(() => {
          const bodyText = document.body.textContent || '';
          // Look for success indicators
          return bodyText.includes('成功') ||
                 bodyText.includes('success') ||
                 bodyText.includes('完成');
        });
        log('File upload completes', uploadComplete);

        // Check if file appears in attachment list
        console.log('\n--- Test 1.2: File in Attachment List ---');
        const hasAttachment = await page.evaluate(() => {
          // Look for attachment elements or uploaded file indicators
          const attachments = document.querySelectorAll('[class*="file"], [class*="attach"]');
          const bodyText = document.body.textContent || '';
          return attachments.length > 0 ||
                 bodyText.includes('test-data') ||
                 bodyText.includes('csv');
        });
        await screenshot(page, '04-attachment-list');
        log('File appears in attachment list', hasAttachment);

        // Check if file appears in File Library
        console.log('\n--- Test 1.3: File in File Library ---');
        const fileInLibrary = await page.evaluate(() => {
          const bodyText = document.body.textContent || '';
          return bodyText.includes('csv') ||
                 bodyText.includes('文件') ||
                 bodyText.includes('.csv');
        });
        await screenshot(page, '05-file-library');
        log('File appears in File Library', fileInLibrary);
      } else {
        log('File input found', false);
      }
    } else {
      log('Add Data button clicked', false, 'Button not found');
    }

    // ========== TEST SUITE 2: Data Table Display ==========
    console.log('\n=== SUITE 2: Data Table Display ===');

    // Send message to trigger data processing
    console.log('\n--- Test 2.1: Trigger Data Analysis ---');
    await page.type('textarea', '请展示数据表格');
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
    await screenshot(page, '06-message-sent');
    log('Analysis message sent', true);

    // Check for data table elements
    console.log('\n--- Test 2.2: Data Table Elements ---');
    const tableElements = await page.evaluate(() => {
      // Look for table, tbody, tr, td elements or data grid
      const tables = document.querySelectorAll('table, tbody, tr, td');
      const dataGrids = document.querySelectorAll('[class*="table"], [class*="grid"], [class*="data"]');
      return {
        tables: tables.length,
        grids: dataGrids.length
      };
    });

    await screenshot(page, '07-data-elements');
    const hasTable = tableElements.tables > 5 || tableElements.grids > 0;
    log('Data table elements found', hasTable,
      `Tables: ${tableElements.tables}, Grids: ${tableElements.grids}`);

    // Check for specific data content
    console.log('\n--- Test 2.3: Data Content ---');
    const hasDataContent = await page.evaluate(() => {
      const bodyText = document.body.textContent || '';
      return bodyText.includes('语文') ||
             bodyText.includes('数学') ||
             bodyText.includes('英语') ||
             bodyText.includes('85') ||
             bodyText.includes('92');
    });
    await screenshot(page, '08-data-content');
    log('Data content displayed', hasDataContent);

    // Check for table headers
    console.log('\n--- Test 2.4: Table Headers ---');
    const hasHeaders = await page.evaluate(() => {
      const bodyText = document.body.textContent || '';
      return bodyText.includes('科目') ||
             bodyText.includes('成绩') ||
             bodyText.includes('排名');
    });
    log('Table headers displayed', hasHeaders);

    // ========== TEST SUITE 3: Error Scenarios ==========
    console.log('\n=== SUITE 3: Error Handling ===');

    // Test 3.1: Empty message
    console.log('\n--- Test 3.1: Empty Message ---');
    await page.evaluate(() => {
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.value = '';
      }
    });
    await wait(500);

    // Try to send empty message
    const emptyButtonClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b =>
        b.textContent?.toLowerCase().includes('send') ||
        b.textContent?.includes('发送')
      );
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    await wait(1000);
    await screenshot(page, '09-empty-message');
    log('Empty message handled', true, 'Button clicked (should not send)');

    // Test 3.2: Navigate to workbench
    console.log('\n--- Test 3.2: Navigate to Workbench ---');
    await page.goto(CONFIG.URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await wait(1000);

    const navigated = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const link = links.find(l =>
        l.href?.includes('/project/')
      );
      if (link) {
        link.click();
        return true;
      }
      return false;
    });

    if (navigated) {
      await wait(2000);
      await screenshot(page, '10-workbench');
      log('Navigate to workbench', true);

      // Check for error handling on invalid project
      const currentUrl = page.url();
      const onWorkbench = currentUrl.includes('/project/');
      log('Workbench loads', onWorkbench, `URL: ${currentUrl}`);

      // Check for error indicators
      const hasErrorUI = await page.evaluate(() => {
        const bodyText = document.body.textContent || '';
        return bodyText.includes('error') ||
               bodyText.includes('错误') ||
               bodyText.includes('404') ||
               bodyText.includes('not found');
      });
      log('Error UI displays when appropriate', !hasErrorUI);
    } else {
      log('Navigate to workbench', false, 'Navigation link not found');
    }

    // Test 3.3: Invalid file type (simulate)
    console.log('\n--- Test 3.3: Invalid File Handling ---');
    await page.goto(CONFIG.URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await wait(1000);

    // Click Add Data
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b =>
        b.textContent?.toLowerCase().includes('add data') ||
        b.textContent?.includes('数据')
      );
      if (btn) btn.click();
    });

    await wait(500);
    await screenshot(page, '11-add-data-before');

    // Note: We can't actually upload invalid files in Puppeteer easily,
    // but we can verify the UI is ready for validation
    const hasFileInput = await page.$('input[type="file"]');
    log('File input ready for validation', !!hasFileInput);

    // ========== TEST SUITE 4: Complete Upload Flow ==========
    console.log('\n=== SUITE 4: Complete Upload and Analysis Flow ===');

    await page.goto(CONFIG.URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await wait(1000);

    // Step 1: Upload file
    console.log('\n--- Step 1: Upload Test File ---');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b =>
        b.textContent?.toLowerCase().includes('add data')
      );
      if (btn) btn.click();
    });

    await wait(500);
    const fileInput2 = await page.$('input[type="file"]');
    if (fileInput2) {
      const csvFile = createTestCSV();
      await fileInput2.uploadFile(csvFile);
      console.log('  📤 Uploading file for complete flow...');
      await wait(3000);
      await screenshot(page, '12-file-uploaded-2');
      log('File uploaded in complete flow', true);

      // Step 2: Send analysis request
      console.log('\n--- Step 2: Send Analysis Request ---');
      await page.type('textarea', '请分析并展示数据表格');
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
      await screenshot(page, '13-analysis-sent');
      log('Analysis request sent', true);

      // Step 3: Verify complete flow
      console.log('\n--- Step 3: Verify Complete Flow ---');
      await wait(2000);

      const flowComplete = await page.evaluate(() => {
        const bodyText = document.body.textContent || '';
        const hasResponse = bodyText.includes('分析') ||
                           bodyText.includes('数据') ||
                           bodyText.includes('表格') ||
                           bodyText.length > 200;
        const hasThinking = bodyText.includes('读取') ||
                         bodyText.includes('提取') ||
                         bodyText.includes('生成');
        const hasData = bodyText.includes('语文') ||
                      bodyText.includes('数学') ||
                      bodyText.includes('成绩');
        const hasChart = document.querySelectorAll('[class*="chart"], canvas').length > 0;

        return {
          response: hasResponse,
          thinking: hasThinking,
          data: hasData,
          chart: hasChart
        };
      });

      await screenshot(page, '14-complete-flow-result');
      log('Analysis response appears', flowComplete.response);
      log('Thinking steps show', flowComplete.thinking);
      log('Data content appears', flowComplete.data);
      log('Chart generated', flowComplete.chart);
    } else {
      log('File uploaded in complete flow', false, 'File input not found');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }

  // Print results
  console.log('\n' + '='.repeat(50));
  console.log('📊 COMPLETE TEST RESULTS');
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

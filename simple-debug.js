// Simple debug script to check page rendering
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('🚀 Accessing workbench page...');
    await page.goto('http://localhost:3000/project/1', { waitUntil: 'networkidle0' });

    // Wait longer for React to hydrate
    console.log('⏳ Waiting for React to hydrate...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('\n🔍 Page content analysis...');
    const pageInfo = await page.evaluate(() => {
      // Check all headings
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
        tag: h.tagName,
        text: h.textContent.substring(0, 50)
      }));

      // Check all tables
      const tables = Array.from(document.querySelectorAll('table')).map(t => {
        const rows = t.querySelectorAll('tr');
        return {
          rowCount: rows.length,
          hasHeaders: rows.length > 0 && rows[0].querySelectorAll('th').length > 0
        };
      });

      // Check for "Data Details" text anywhere
      const dataDetailsFound = document.body.textContent.includes('Data Details');

      // Check for table-related text
      const hasTableContent = document.body.textContent.includes('科目') &&
                             document.body.textContent.includes('成绩');

      // Check for pagination controls
      const hasPagination = document.body.textContent.includes('首页') ||
                          document.body.textContent.includes('上一页');

      // Check for filter controls
      const hasFilter = document.body.textContent.includes('筛选') ||
                      document.body.textContent.includes('导出');

      return {
        headings,
        tableCount: tables.length,
        tables,
        dataDetailsFound,
        hasTableContent,
        hasPagination,
        hasFilter,
        bodyPreview: document.body.textContent.substring(0, 500)
      };
    });

    console.log('Page Info:', JSON.stringify(pageInfo, null, 2));

    // Take screenshot
    console.log('\n📸 Taking screenshot...');
    await page.screenshot({
      path: 'test-screenshots/00-simple-debug.png',
      fullPage: true
    });
    console.log('✓ Screenshot saved');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
    console.log('\n🎉 Debug completed!');
  }
})();

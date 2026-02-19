// Debug script to check DataDetailsTable rendering
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('🚀 Accessing workbench page...');
    await page.goto('http://localhost:3000/project/1', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check what's in the Data Details section
    console.log('\n🔍 Checking Data Details section...');
    const dataDetailsInfo = await page.evaluate(() => {
      // Find section containing "Data Details" text
      const allH4 = Array.from(document.querySelectorAll('h4'));
      const dataDetailsH4 = allH4.find(h => h.textContent === 'Data Details');

      if (!dataDetailsH4) {
        return { error: 'Data Details h4 not found', allH4Text: allH4.map(h => h.textContent) };
      }

      const parent = dataDetailsH4.parentElement;

      // Check for table in the parent
      const table = parent.querySelector('table');
      const tableInfo = table ? 'Table found' : 'No table';

      // Check for "No data available" message
      const noDataMessage = parent.textContent.includes('No data available');

      // Check all text in the section
      const allText = parent.textContent;

      // Check for div with border (table container)
      const tableContainer = parent.querySelector('.border.rounded-lg');
      const containerInfo = tableContainer ? 'Table container found' : 'No container';

      // Check all child elements
      const children = Array.from(parent.children).map(child => ({
        tag: child.tagName,
        classes: child.className,
        text: child.textContent.substring(0, 50)
      }));

      return {
        h4Text: dataDetailsH4.textContent,
        tableInfo,
        noDataMessage,
        allText: allText.substring(0, 300),
        containerInfo,
        children
      };
    });

    console.log('Data Details Info:', JSON.stringify(dataDetailsInfo, null, 2));

    // Take screenshot
    await page.screenshot({
      path: 'test-screenshots/00-debug.png',
      fullPage: true
    });

    // Check React state if possible
    console.log('\n🔍 Checking React Fiber tree...');
    const reactInfo = await page.evaluate(() => {
      // Try to get data from __REACT_DEVTOOLS_GLOBAL_HOOK__
      const devtools = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
      if (devtools && devtools.renderers) {
        const renderers = Object.keys(devtools.renderers);
        return { devtoolsDetected: true, renderers };
      }
      return { devtoolsDetected: false };
    });

    console.log('React Info:', JSON.stringify(reactInfo, null, 2));

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
    console.log('\n🎉 Debug completed!');
  }
})();

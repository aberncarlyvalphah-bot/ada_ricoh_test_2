// Check for console errors
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Capture console errors
    const consoleLogs = [];
    page.on('console', msg => {
      consoleLogs.push({
        type: msg.type(),
        text: msg.text().substring(0, 200)
      });
    });

    // Capture page errors
    const pageErrors = [];
    page.on('pageerror', error => {
      pageErrors.push({
        message: error.message.substring(0, 200),
        stack: error.stack ? error.stack.substring(0, 200) : 'No stack'
      });
    });

    console.log('🚀 Accessing workbench page...');
    await page.goto('http://localhost:3000/project/1', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('\n📋 Console Logs:');
    consoleLogs.forEach(log => {
      console.log(`  [${log.type}] ${log.text}`);
    });

    console.log('\n❌ Page Errors:');
    if (pageErrors.length === 0) {
      console.log('  No errors detected');
    } else {
      pageErrors.forEach((error, i) => {
        console.log(`  Error ${i + 1}:`);
        console.log(`    Message: ${error.message}`);
        console.log(`    Stack: ${error.stack}`);
      });
    }

    // Get error message from page if exists
    const errorInfo = await page.evaluate(() => {
      const errorElement = document.querySelector('h2');
      if (errorElement && errorElement.textContent.includes('Application error')) {
        return {
          hasError: true,
          message: errorElement.textContent
        };
      }
      return { hasError: false };
    });

    if (errorInfo.hasError) {
      console.log('\n⚠️  Page Error Message:');
      console.log(`  ${errorInfo.message}`);

      // Try to get more error details
      const errorDetails = await page.evaluate(() => {
        const bodyText = document.body.textContent;
        return bodyText.substring(0, 1000);
      });
      console.log('\nFull error text:');
      console.log(errorDetails);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await browser.close();
    console.log('\n🎉 Debug completed!');
  }
})();

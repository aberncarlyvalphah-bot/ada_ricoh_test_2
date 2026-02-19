// Debug script to check file input element
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('🚀 Accessing homepage...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if file input element exists
    console.log('\n🔍 Checking file input element...');
    const inputCheck = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const fileInputs = inputs.filter(input =>
        input.type === 'file' &&
        input.accept &&
        input.accept.includes('csv') &&
        input.accept.includes('xlsx')
      );

      return {
        found: fileInputs.length > 0,
        count: fileInputs.length,
        details: fileInputs.map(input => ({
          type: input.type,
          accept: input.accept,
          hidden: input.hidden,
          id: input.id,
          className: input.className
        }))
      };
    });

    console.log('File input check result:', JSON.stringify(inputCheck, null, 2));

    if (inputCheck.found) {
      console.log('✓ File input element found');

      // Get input details
      const fileInput = await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input[type="file"]'));
        const fileInput = inputs[0];
        return {
          id: fileInput.id,
          type: fileInput.type,
          accept: fileInput.accept,
          hidden: fileInput.hidden
        };
      });

      console.log('File input details:', JSON.stringify(fileInput, null, 2));
      console.log(`Input ID: ${fileInput.id}`);
      console.log(`Input hidden: ${fileInput.hidden}`);
      console.log(`Input accept: ${fileInput.accept}`);
    }

    // Take screenshot
    await page.screenshot({
      path: 'test-screenshots/16-file-input-check.png',
      fullPage: true
    });
    console.log('✓ Screenshot saved');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
    console.log('\n🎉 Test completed!');
  }
})();

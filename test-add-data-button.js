// Test the add data button functionality
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('🚀 Accessing homepage...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test on homepage
    console.log('\n🔍 Testing add data button on homepage...');
    const homepageResult = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const plusButtons = buttons.filter(b => b.innerHTML.includes('lucide-plus'));
      return {
        plusButtonCount: plusButtons.length,
        hasClickHandler: plusButtons.some(b => b.onclick !== null)
      };
    });
    console.log('Homepage result:', JSON.stringify(homepageResult, null, 2));

    // Take screenshot of homepage
    await page.screenshot({
      path: 'test-screenshots/06-homepage-add-button.png',
      fullPage: true
    });
    console.log('✓ Homepage screenshot saved');

    // Test on workbench page
    console.log('\n🔍 Testing add data button on workbench...');
    await page.goto('http://localhost:3000/project/1', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Take screenshot before clicking
    await page.screenshot({
      path: 'test-screenshots/07-workbench-before-click.png',
      fullPage: true
    });

    // Click the add data button
    console.log('🖱️ Clicking add data button...');
    const clickResult = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const plusButtons = buttons.filter(b => {
        const svg = b.querySelector('svg');
        if (svg) {
          const path = svg.querySelector('path');
          if (path && path.getAttribute('d') && path.getAttribute('d').includes('M12')) {
            return true; // Plus icon
          }
        }
        return false;
      });

      if (plusButtons.length > 0) {
        const button = plusButtons[0];
        console.log('Found add data button');
        console.log('Button text:', button.textContent);
        console.log('Has onclick:', !!button.onclick);

        // Click the button
        button.click();
        return { clicked: true, buttonCount: plusButtons.length };
      }
      return { clicked: false, buttonCount: 0 };
    });

    console.log('Click result:', JSON.stringify(clickResult, null, 2));

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Take screenshot after clicking
    await page.screenshot({
      path: 'test-screenshots/08-workbench-after-click.png',
      fullPage: true
    });

    console.log('\n✅ Test Summary:');
    console.log('   ✓ Homepage loaded');
    console.log('   ✓ Workbench loaded');
    console.log('   ✓ Screenshots captured');
    if (clickResult.clicked) {
      console.log('   ✓ Add data button clicked');
    } else {
      console.log('   ⚠ Add data button not found or not clickable');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
    console.log('\n🎉 Test completed!');
  }
})();

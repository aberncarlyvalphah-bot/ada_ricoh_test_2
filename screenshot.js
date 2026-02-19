const puppeteer = require('puppeteer');
const path = require('path');

async function screenshot() {
  const browser = await puppeteer.launch({
    headless: 'new',
  });
  const page = await browser.newPage();

  // Set viewport to a typical desktop size
  await page.setViewport({ width: 1920, height: 1080 });

  // Navigate to workbench page
  await page.goto('http://localhost:3000/project/1', {
    waitUntil: 'networkidle2',
    timeout: 30000,
  });

  // Wait for the page to fully render
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Take screenshot
  const screenshotPath = path.join(__dirname, 'workbench-screenshot.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });

  console.log('Screenshot saved to:', screenshotPath);

  // Close browser
  await browser.close();
}

screenshot().catch(console.error);

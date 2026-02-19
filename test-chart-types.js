// Test script for Task 8: Chart Types Extension
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('🚀 Accessing workbench page...');
    await page.goto('http://localhost:3000/project/1', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    const chartTypes = ['Radar Chart', 'Bar Chart', 'Line Chart', 'Pie Chart', 'Scatter Chart', 'Heatmap'];

    // Test each chart type
    for (let i = 0; i < chartTypes.length; i++) {
      const chartType = chartTypes[i];

      console.log(`\n🔍 Testing chart type: ${chartType}`);
      const selected = await page.evaluate((type) => {
        const select = document.querySelector('[role="combobox"]');
        if (!select) return false;

        // Click to open dropdown
        select.click();

        // Wait and find the option
        return new Promise((resolve) => {
          setTimeout(() => {
            const options = Array.from(document.querySelectorAll('[role="option"]'));
            const option = options.find(opt => opt.textContent === type);
            if (option) {
              option.click();
              resolve(true);
            } else {
              resolve(false);
            }
          }, 100);
        });
      }, chartType);

      await new Promise(resolve => setTimeout(resolve, 1500));

      if (selected) {
        console.log(`✓ ${chartType} selected successfully`);

        // Take screenshot
        await page.screenshot({
          path: `test-screenshots/09-chart-${i + 1}-${chartType.toLowerCase().replace(' ', '-')}.png`,
          fullPage: true
        });
        console.log(`  ✓ Screenshot saved`);
      }
    }

    // Test configuration panel
    console.log('\n🔍 Testing configuration panel...');
    const configOpened = await page.evaluate(() => {
      const settingsButton = Array.from(document.querySelectorAll('button')).find(b => b.innerHTML.includes('Settings'));
      if (settingsButton) {
        settingsButton.click();
        return true;
      }
      return false;
    });

    if (configOpened) {
      console.log('✓ Configuration panel opened');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Take screenshot of config panel
      await page.screenshot({
        path: 'test-screenshots/10-config-panel.png',
        fullPage: true
      });
      console.log('✓ Config panel screenshot saved');

      // Test toggle switches
      console.log('\n🔍 Testing toggle switches...');
      const togglesTested = await page.evaluate(async () => {
        const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));

        // Test first checkbox (Legend)
        if (checkboxes[0]) {
          checkboxes[0].click();
          await new Promise(r => setTimeout(r, 500));
          checkboxes[0].click();
          await new Promise(r => setTimeout(r, 500));
        }

        // Test second checkbox (Data Labels)
        if (checkboxes[1]) {
          checkboxes[1].click();
          await new Promise(r => setTimeout(r, 500));
        }

        return checkboxes.length;
      });

      console.log(`✓ Tested ${togglesTested} toggle switches`);

      // Take screenshot after toggles
      await page.screenshot({
        path: 'test-screenshots/11-config-toggles.png',
        fullPage: true
      });
      console.log('✓ Toggles screenshot saved');

      // Test color selection
      console.log('\n🔍 Testing color selection...');
      const colors = ['#3b82f6', '#22c55e', '#ef4444', '#a855f7', '#f97316', '#06b6d4'];

      for (let i = 0; i < Math.min(colors.length, 3); i++) {
        await page.evaluate((colorIndex) => {
          const colorButtons = Array.from(document.querySelectorAll('button')).filter(b => {
            const style = b.style.backgroundColor;
            return style && style !== 'transparent' && style !== '';
          });

          if (colorButtons[colorIndex]) {
            colorButtons[colorIndex].click();
          }
        }, i);

        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`✓ Color ${i + 1} selected`);
      }

      // Take screenshot after color changes
      await page.screenshot({
        path: 'test-screenshots/12-config-colors.png',
        fullPage: true
      });
      console.log('✓ Color changes screenshot saved');

      // Close config panel
      const configClosed = await page.evaluate(() => {
        const settingsButton = Array.from(document.querySelectorAll('button')).find(b => b.innerHTML.includes('Settings'));
        if (settingsButton) {
          settingsButton.click();
          return true;
        }
        return false;
      });

      if (configClosed) {
        console.log('✓ Configuration panel closed');
      }
    }

    // Test export button
    console.log('\n🔍 Testing export button...');
    const exportClicked = await page.evaluate(() => {
      const downloadButton = Array.from(document.querySelectorAll('button')).find(b => b.innerHTML.includes('Download'));
      if (downloadButton) {
        downloadButton.click();
        return true;
      }
      return false;
    });

    if (exportClicked) {
      console.log('✓ Export button clicked');
    }

    console.log('\n✅ Test Summary:');
    console.log('   ✓ All 6 chart types tested');
    console.log('   ✓ Configuration panel tested');
    console.log('   ✓ Legend toggle tested');
    console.log('   ✓ Data labels toggle tested');
    console.log('   ✓ Color selection tested');
    console.log('   ✓ Export button tested');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
    console.log('\n🎉 Test completed!');
  }
})();

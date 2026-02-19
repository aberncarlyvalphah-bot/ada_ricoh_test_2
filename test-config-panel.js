// Test script for configuration panel visibility
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('🚀 Accessing workbench page...');
    await page.goto('http://localhost:3000/project/1', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if Settings button exists
    console.log('\n🔍 Checking Settings button...');
    const settingsCheck = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const settingsButton = buttons.find(btn =>
        btn.innerHTML.includes('Settings') ||
        btn.querySelector('svg')?.classList.contains('lucide-settings')
      );
      return {
        found: !!settingsButton,
        text: settingsButton?.textContent.trim(),
        html: settingsButton?.outerHTML.substring(0, 200)
      };
    });

    console.log('Settings button check:', JSON.stringify(settingsCheck, null, 2));

    if (!settingsCheck.found) {
      console.error('❌ Settings button not found!');
      await browser.close();
      return;
    }

    // Check initial state - config panel should be hidden
    console.log('\n🔍 Checking initial state (config panel hidden)...');
    const initialState = await page.evaluate(() => {
      const configPanels = Array.from(document.querySelectorAll('.border-b.bg-muted\\/30'));
      return {
        configPanelCount: configPanels.length,
        configPanelVisible: configPanels.some(panel => {
          const style = window.getComputedStyle(panel);
          return style.display !== 'none' && style.visibility !== 'hidden';
        })
      };
    });

    console.log('Initial state:', JSON.stringify(initialState, null, 2));

    // Click Settings button to show config panel
    console.log('\n🔍 Clicking Settings button...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const settingsButton = buttons.find(btn =>
        btn.innerHTML.includes('Settings') ||
        btn.querySelector('svg')?.classList.contains('lucide-settings')
      );
      if (settingsButton) settingsButton.click();
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if config panel is now visible
    console.log('\n🔍 Checking config panel visibility after click...');
    const afterClickState = await page.evaluate(() => {
      const configPanel = document.querySelector('.border-b.bg-muted\\/30');
      if (!configPanel) return { found: false };

      const style = window.getComputedStyle(configPanel);
      const rect = configPanel.getBoundingClientRect();
      const parentRect = configPanel.parentElement?.getBoundingClientRect();

      return {
        found: true,
        visible: style.display !== 'none' && style.visibility !== 'hidden',
        display: style.display,
        visibility: style.visibility,
        offsetHeight: configPanel.offsetHeight,
        scrollHeight: configPanel.scrollHeight,
        clientHeight: configPanel.clientHeight,
        rect: {
          top: Math.round(rect.top),
          left: Math.round(rect.left),
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        },
        parentHeight: parentRect ? Math.round(parentRect.height) : 0
      };
    });

    console.log('After click state:', JSON.stringify(afterClickState, null, 2));

    if (!afterClickState.found) {
      console.error('❌ Config panel element not found!');
    } else if (!afterClickState.visible) {
      console.error('❌ Config panel is not visible!');
    } else {
      console.log('✅ Config panel is visible!');
      console.log(`   Height: ${afterClickState.offsetHeight}px`);
      console.log(`   Scroll height: ${afterClickState.scrollHeight}px`);

      // Check if all controls are visible
      console.log('\n🔍 Checking config panel controls...');
      const controlsCheck = await page.evaluate(() => {
        const configPanel = document.querySelector('.border-b.bg-muted\\/30');
        if (!configPanel) return { found: false };

        const checkboxes = configPanel.querySelectorAll('input[type="checkbox"]');
        const colorButtons = configPanel.querySelectorAll('button[style*="background-color"]');
        const labels = Array.from(configPanel.querySelectorAll('label')).map(l => l.textContent.trim());

        const panelRect = configPanel.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        const controlsVisibility = [];
        checkboxes.forEach((cb, i) => {
          const rect = cb.getBoundingClientRect();
          controlsVisibility.push({
            type: 'checkbox',
            index: i,
            inViewport: rect.top >= 0 && rect.bottom <= viewportHeight,
            top: Math.round(rect.top),
            bottom: Math.round(rect.bottom)
          });
        });

        return {
          found: true,
          checkboxCount: checkboxes.length,
          colorButtonCount: colorButtons.length,
          labels: labels.filter(l => l),
          controlsVisibility,
          panelInViewport: panelRect.top >= 0 && panelRect.bottom <= viewportHeight
        };
      });

      console.log('Controls check:', JSON.stringify(controlsCheck, null, 2));

      // Check scroll behavior
      console.log('\n🔍 Checking scroll behavior...');
      const scrollCheck = await page.evaluate(() => {
        const rightPanel = document.querySelector('.flex-1.flex.flex-col.min-w-0.min-h-0');
        if (!rightPanel) return { found: false };

        const computedStyle = window.getComputedStyle(rightPanel);
        const scrollInfo = {
          overflowY: computedStyle.overflowY,
          overflowX: computedStyle.overflowX,
          scrollHeight: rightPanel.scrollHeight,
          clientHeight: rightPanel.clientHeight,
          scrollTop: rightPanel.scrollTop,
          maxScroll: rightPanel.scrollHeight - rightPanel.clientHeight
        };

        return scrollInfo;
      });

      console.log('Scroll check:', JSON.stringify(scrollCheck, null, 2));
    }

    // Take screenshot
    await page.screenshot({
      path: 'test-screenshots/17-config-panel-test.png',
      fullPage: true
    });
    console.log('\n✓ Screenshot saved: test-screenshots/17-config-panel-test.png');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
    console.log('\n🎉 Test completed!');
  }
})();

// Test script for left and right panel scrollbars
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('🚀 Accessing workbench page...');
    await page.goto('http://localhost:3000/project/1', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Take initial screenshot
    await page.screenshot({
      path: 'test-screenshots/18-scrollbars-before.png',
      fullPage: false
    });
    console.log('✓ Initial screenshot saved');

    // Check layout structure
    console.log('\n🔍 Checking layout structure...');
    const layoutCheck = await page.evaluate(() => {
      const outer = document.querySelector('.flex.h-screen');
      const main = document.querySelector('main');
      const leftPanel = main?.children[0];
      const rightPanel = main?.children[1];

      const getOverflow = (el) => {
        if (!el) return { overflowY: '', overflowX: '' };
        const style = window.getComputedStyle(el);
        return {
          overflowY: style.overflowY,
          overflowX: style.overflowX
        };
      };

      const getDimensions = (el) => {
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return {
          offsetHeight: el.offsetHeight,
          scrollHeight: el.scrollHeight,
          clientHeight: el.clientHeight,
          scrollTop: el.scrollTop,
          maxScroll: el.scrollHeight - el.clientHeight,
          canScroll: el.scrollHeight > el.clientHeight
        };
      };

      return {
        outer: {
          className: outer?.className,
          ...getOverflow(outer),
          height: outer?.offsetHeight
        },
        main: {
          className: main?.className,
          ...getOverflow(main),
          height: main?.offsetHeight
        },
        leftPanel: {
          className: leftPanel?.className,
          width: leftPanel?.offsetWidth,
          ...getOverflow(leftPanel),
          ...getDimensions(leftPanel)
        },
        rightPanel: {
          className: rightPanel?.className,
          width: rightPanel?.offsetWidth,
          ...getOverflow(rightPanel),
          ...getDimensions(rightPanel)
        }
      };
    });

    console.log('Layout check:', JSON.stringify(layoutCheck, null, 2));

    // Check if scrollbars are visible
    console.log('\n🔍 Checking scrollbars visibility...');
    const scrollbarCheck = await page.evaluate(() => {
      const main = document.querySelector('main');
      const leftPanel = main?.children[0];
      const rightPanel = main?.children[1];

      const checkScrollbar = (el, name) => {
        if (!el) return { name, hasScrollbar: false };
        const style = window.getComputedStyle(el);
        const hasScrollbarY = style.overflowY === 'auto' || style.overflowY === 'scroll';
        const hasScrollbarX = style.overflowX === 'auto' || style.overflowX === 'scroll';
        const needsScroll = el.scrollHeight > el.clientHeight;
        return {
          name,
          hasScrollbarY,
          hasScrollbarX,
          needsScroll,
          overflowY: style.overflowY,
          overflowX: style.overflowX
        };
      };

      return {
        leftPanel: checkScrollbar(leftPanel, 'Left Panel'),
        rightPanel: checkScrollbar(rightPanel, 'Right Panel')
      };
    });

    console.log('Scrollbar check:', JSON.stringify(scrollbarCheck, null, 2));

    // Test scrolling on both panels
    console.log('\n🔍 Testing scroll functionality...');
    const scrollTest = await page.evaluate(() => {
      const main = document.querySelector('main');
      const leftPanel = main?.children[0];
      const rightPanel = main?.children[1];

      const testScroll = (el, name) => {
        if (!el) return { name, canScroll: false };

        const beforeScroll = el.scrollTop;
        const maxScroll = el.scrollHeight - el.clientHeight;

        // Try to scroll down
        el.scrollTop = Math.min(maxScroll, 100);

        const afterScroll = el.scrollTop;
        const scrolled = afterScroll > beforeScroll;

        // Reset
        el.scrollTop = 0;

        return {
          name,
          canScroll: maxScroll > 0,
          maxScroll,
          beforeScroll,
          afterScroll,
          scrolled
        };
      };

      return {
        leftPanel: testScroll(leftPanel, 'Left Panel'),
        rightPanel: testScroll(rightPanel, 'Right Panel')
      };
    });

    console.log('Scroll test:', JSON.stringify(scrollTest, null, 2));

    // Scroll right panel to see all content
    console.log('\n🔍 Scrolling right panel to bottom...');
    await page.evaluate(() => {
      const main = document.querySelector('main');
      const rightPanel = main?.children[1];
      if (rightPanel) {
        rightPanel.scrollTop = rightPanel.scrollHeight - rightPanel.clientHeight;
      }
    });

    await new Promise(resolve => setTimeout(resolve, 500));

    // Screenshot after scrolling
    await page.screenshot({
      path: 'test-screenshots/19-scrollbars-after.png',
      fullPage: false
    });
    console.log('✓ After scroll screenshot saved');

    // Check visibility of chart and table
    console.log('\n🔍 Checking chart and table visibility...');
    const visibilityCheck = await page.evaluate(() => {
      const chart = document.querySelector('.echarts-for-react');
      const table = document.querySelector('table');

      const getVisibility = (el, name) => {
        if (!el) return { name, visible: false, reason: 'not found' };

        const rect = el.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        return {
          name,
          visible: rect.top < viewportHeight && rect.bottom > 0,
          fullyVisible: rect.top >= 0 && rect.bottom <= viewportHeight,
          partiallyVisible: (rect.top < viewportHeight && rect.top > 0) ||
                         (rect.bottom > 0 && rect.bottom < viewportHeight),
          rect: {
            top: Math.round(rect.top),
            bottom: Math.round(rect.bottom),
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
            height: Math.round(rect.height)
          }
        };
      };

      return {
        chart: getVisibility(chart, 'Chart'),
        table: getVisibility(table, 'Table')
      };
    });

    console.log('Visibility check:', JSON.stringify(visibilityCheck, null, 2));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
    console.log('\n🎉 Test completed!');
  }
})();

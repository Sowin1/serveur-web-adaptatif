import { test, expect } from '@playwright/test';

test('audit of the loading time', async ({ page }) => {
  const start = Date.now();

  await page.goto('https://google.com', {
    waitUntil: 'load',
  });

  const loadingTime = Date.now() - start;

  console.log(`Loading time : ${loadingTime} ms`);

  expect(loadingTime).toBeLessThan(5000);
});

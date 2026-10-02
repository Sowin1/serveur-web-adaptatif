import { test, expect } from '@playwright/test';

test('audit du temps de chargement', async ({ page }) => {
  const start = Date.now();

  await page.goto('https://lesitedecon', {
    waitUntil: 'load',
  });

  const loadingTime = Date.now() - start;

  console.log(`Temps de chargement : ${loadingTime} ms`);

  expect(loadingTime).toBeLessThan(5000);
});
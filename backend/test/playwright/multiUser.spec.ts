import { test, expect, chromium } from '@playwright/test';

test('simulation of a period of high consumption', async () => {
  const browser = await chromium.launch();

  const numberOfUsers = 10;

  const users = await Promise.all(
    Array.from({ length: numberOfUsers }, async () => {
      const page = await browser.newPage();

      const start = Date.now();

      const response = await page.goto('https://lesite', {
        waitUntil: 'load',
      });

      const loadingTime = Date.now() - start;

      return {
        status: response?.status(),
        loadingTime,
      };
    }),
  );

  console.log('══════════════════════════════');
  console.log(' HIGH-LOAD SIMULATION');
  console.log('══════════════════════════════');

  users.forEach((user, index) => {
    console.log(
      `Utilisateur ${index + 1} : ${user.status} - ${user.loadingTime} ms`,
    );
  });

  await browser.close();
});
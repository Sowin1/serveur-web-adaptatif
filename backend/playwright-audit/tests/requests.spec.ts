import { test } from '@playwright/test';

test('audit du nombre de requêtes', async ({ page }) => {
  const requests: string[] = [];

  page.on('request', (request) => {
    requests.push(request.url());
  });

  await page.goto('https://lesitedecon', {
    waitUntil: 'load',
  });

  console.log(`Nombre total de requêtes : ${requests.length}`);

  requests.forEach((url, index) => {
    console.log(`${index + 1}. ${url}`);
  });
});
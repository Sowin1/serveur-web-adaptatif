import { test } from '@playwright/test';

test('audit of the number of requests', async ({ page }) => {
  const requests: string[] = [];

  page.on('request', (request) => {
    requests.push(request.url());
  });

  await page.goto('https://google.com', {
    waitUntil: 'load',
  });

  console.log(`Total number of requests : ${requests.length}`);

  requests.forEach((url, index) => {
    console.log(`${index + 1}. ${url}`);
  });
});

import puppeteer from 'puppeteer';

export const main = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto('https://example.com');
  await page.screenshot({ path: 'photo.png' });
};

main();

#!/usr/bin/env node

const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://date-fns.org/docs/Getting-Started', { waitUntil: 'networkidle' });
  const content = await page.evaluate(() => window.document.body.innerHTML);

  console.log(content);

  browser.close();
})();

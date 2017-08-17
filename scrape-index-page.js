#!/usr/bin/env node

const puppeteer = require('puppeteer');

const { getDocumentHTML } = require('./utils.js');

(async (shouldWait) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://date-fns.org/docs/Getting-Started', {
    waitUntil: shouldWait ? 'networkidle' : 'load', // 'load' is default
  });
  const content = await page.evaluate(getDocumentHTML);

  console.log(content);

  browser.close();
})(true);

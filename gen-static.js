#!/usr/bin/env node

const puppeteer = require('puppeteer');
const mkdirp = require('mkdirp');
const path = require('path');
const fs = require('fs');
const { Observable } = require('rxjs');
const writeFile = Observable.bindNodeCallback(fs.writeFile);

const { getDocumentHTML } = require('./utils.js');

/**
 * NOTE: By default the headless browser will wait 1s after all network traffic
 * has ceased to declare the wait over. However, there is no guarantee the app
 * will actually be rendered at this point. It also means that even if the app
 * renders before then it will still wait. So this could be improved.
 */
const loadURL = async (url) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle' }); // See NOTE
  const content = await page.evaluate(getDocumentHTML);

  browser.close();

  return content;
};

// NOTE: The process sort of went crazy when using max concurrency. I'm sure we
// could do more than 1 at a time but let's not overdo it
const main = (urls) => {
  return Observable.from(urls)
    .concatMap(relative => { // See NOTE
      const fullURL = `http://localhost:3111${relative}`;
      const outpath = path.resolve(`./tmp/static${relative}/index.html`);

      // Since the URLs are versioned there's no need to do anything if the file
      // has already been written.
      if (fs.existsSync(outpath)) {
        console.log(`[Skipping] Already exists: ${outpath}`);
        return Observable.empty();
      }

      return Observable.fromPromise(loadURL(fullURL))
        .mergeMap(content => {
          console.log(`[Writing]: ${outpath}`);
          mkdirp.sync(path.dirname(outpath))
          return writeFile(outpath, content);
        });
    })
};

main(require('./tmp/routes.json')).subscribe(
  null,
  err => console.error(err),
  () => console.log('All done.')
);



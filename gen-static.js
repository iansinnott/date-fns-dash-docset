#!/usr/bin/env node

const puppeteer = require('puppeteer');
const mkdirp = require('mkdirp');
const path = require('path');
const fs = require('fs');
const { Observable } = require('rxjs');
const writeFile = Observable.bindNodeCallback(fs.writeFile);

const { loadURL } = require('./utils.js');

// NOTE: The process sort of went crazy when using max concurrency. I'm not sure
// what the max is but there's no need to push it
// NOTE: This fully requires the site be running in spa mode on the port
// specified
const main = (urls) => {
  if (urls.length === 0) {
    const msg = 'No URLs passed to gen-static. Ensure that routes were generated properly';
    console.error(msg);
    console.error();
    process.exitStatus = 1;
    return Observable.throw(new Error(msg));
  }

  // It's relatively expensive to render out all these URLs so you can run a
  // debug mode that will only operate on a few of them.
  if (process.env.DEBUG) {
    urls = urls.slice(0,3);
  }

  return Observable.from(urls)
    .mergeMap(relative => {
      const fullURL = `http://localhost:3111${relative}`; // See NOTE
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
    }, 2); // See NOTE
};

main(require('./tmp/routes.json')).subscribe(
  null,
  err => console.error(err),
  () => console.log('All done.')
);



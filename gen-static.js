#!/usr/bin/env node

const child_process = require('child_process');
const puppeteer = require('puppeteer');
const mkdirp = require('mkdirp');
const path = require('path');
const fs = require('fs');
const { Observable } = require('rxjs');
const writeFile = Observable.bindNodeCallback(fs.writeFile);

const { loadURL } = require('./utils.js');

const PORT = process.env.PORT || 3111;

const spawnServer = () => Observable.create(obs => {
  const filepath = path.resolve('./serve-as-spa.js');
  const htmlPath = path.resolve('./tmp/generated/index.html');

  let cp;

  try {
    cp = child_process.fork(filepath, [ htmlPath ], {
      stdio: 'pipe',
      env: {
        PORT,
      },
    });
  } catch (err) {
    obs.error(err);
  }

  if (cp) {
    cp.stdout.setEncoding('utf8');
    cp.stderr.setEncoding('utf8');

    cp.stdout.on('data', data => obs.next(data));
    cp.stderr.on('data', data => obs.error(data));

    cp.on('error', err => {
      console.error('Error -------');
      obs.error(err);
    });
    cp.on('exit', () => {
      console.error('Closed');
      obs.complete();
    });
    cp.on('close', () => {
      console.error('Closed');
      obs.complete();
    });
    cp.on('disconnect', (...args) => {
      console.error('Disconnected');
      obs.error(args);
    });
  }

  return () => {
    console.log('Discarding server');
    cp.kill();
    cp.removeAllListeners();
  };
});

// NOTE: The process sort of went crazy when using max concurrency so let's just
// base it off core count
const CONCURRENCY = require('os').cpus().length;

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

  return spawnServer()
    .bufferTime(1000) // Wait a sec to ensure server has started up. Also accumulate messages
    .first() // The server never completes, so just take one since we are only really concerned with it being running before continuing
    .mergeMap((args) => {
      console.log(...args);

      return Observable.from(urls)
        .mergeMap(relative => {
          const fullURL = `http://localhost:${PORT}${relative}`; // See NOTE
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
        }, CONCURRENCY);
    })
};

main(require('./tmp/routes.json')).subscribe(
  data => data && console.log('DATA', data), // Shouldn't be any data coming through
  err => {
    if (err.toString().includes('EADDRINUSE')) {
      console.error('Server in use, to find blocking pid try:\n');
      console.error(`  lsof -i :${PORT}`);
      console.error('\nFull error below:');
      console.error(err);
      return;
    }

    console.error('ERR\n', err);
  },
  () => console.log('All done.')
);



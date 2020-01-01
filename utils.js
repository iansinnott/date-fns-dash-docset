const puppeteer = require('puppeteer');
const { Observable } = require('rxjs');

const fromReadableStream = (stream) => Observable.create(obs => {
  const next = chunk => obs.next(chunk);
  const error = err => obs.error(err);
  const complete = () => obs.complete();

  // Set UTF-8 so we don't get Buffer instances read through
  stream.setEncoding('utf8');

  // Setup
  stream.on('data', next);
  stream.on('error', error);
  stream.on('end', complete);

  // Cleanup
  return () => {
    stream.removeAllListeners();
  };
});

const stripNavigation = () => {
  document.querySelector('.docs-finder').remove();
  document.querySelector('.docs_nav_bar').remove();

  // correct paddings
  document.querySelector('.docs-content').style.paddingLeft = 0;
  document.querySelector('.docs').style.paddingTop = 0;
}

const getDocumentHTML = () => {
  const serializer = new XMLSerializer();
  return serializer.serializeToString(window.document);
};

/**
 * Load a URL in headless chrome. This could easily be accomplished with curl or
 * any request library excpet using chrome allows us to wait until all network
 * requests on the page have finished and let javascript run. This is super
 * important for react based sites like date-fns since they don't contain body
 * markup on initial load.
 *
 * NOTE: By default the headless browser will wait 1s after all network traffic
 * has ceased to declare the wait over. However, there is no guarantee the app
 * will actually be rendered at this point. It also means that even if the app
 * renders before then it will still wait. So this could be improved.
 */
const loadURL = async (url, preserveNavigation = false) => {
  const browser = await puppeteer.launch({
    args: [
      '--disable-web-security',
    ]
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle', networkIdleTimeout: 5000 }); // See NOTE

  if (!preserveNavigation) {
    await page.evaluate(stripNavigation);
  }

  const content = await page.evaluate(getDocumentHTML);

  browser.close();

  return content;
};

const isDebugging = () => Boolean(process.env.DEBUG);

module.exports = {
  getDocumentHTML,
  fromReadableStream,
  loadURL,
  isDebugging,
};

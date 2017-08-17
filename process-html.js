#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { map, pipe, trim } = require('ramda');
const cheerio = require('cheerio');
const stripIndent = require('strip-indent');

const { fromReadableStream } = require('./utils.js');

const heredoc = pipe(trim, stripIndent);

const processHTML = (html) => {
  const $ = cheerio.load(html);

  // Add custom styles
  $('head').append(heredoc(`
    <style>
      .ui .docs-finder {
        display: none;
      }
      .ui .docs {
        padding-top: 0;
      }
      .ui .docs_nav_bar {
        display: none;
      }
      .ui .docs-content {
        padding-left: 0;
      }
      .ui .jsdoc_usage-options .jsdoc_usage-option:not(:first-child) {
        display: none;
      }
    </style>
  `));

  // Remove non-local scripts. These docs are meant for offline use so let's not
  // pull in any remote scripts
  $('script[type="text/javascript"]')
    .filter((i, el) => {
      const src = $(el).attr('src');
      return !/^\/assets\/js/.test(src);
    })
    .remove();

  // Remove unecessary meta tags
  $('meta')
    .filter((i, el) => {
      const name = $(el).attr('name') || $(el).attr('property');
      return /^(twitter|og):/.test(name);
    })
    .remove();

  return $.html();
};

const main = pipe(
  fromReadableStream,
  map(trim),
  map(processHTML)
);

main(process.stdin).subscribe(
  result => console.log(result),
  err => {
    console.error(err);
    process.exit(1);
  },
);

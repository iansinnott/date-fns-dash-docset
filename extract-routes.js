#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { map, pipe, trim } = require('ramda');
const cheerio = require('cheerio');

const { fromReadableStream } = require('./utils.js');

const getLinks = (html) => {
  const $ = cheerio.load(html);

  const links = $('.docs_finder-list > a')
    .map((_, el) => $(el).attr('href'))
    .toArray();

  return links;
  // return $.html();
};

const main = pipe(
  fromReadableStream,
  map(trim),
  map(getLinks)
);

main(process.stdin).subscribe(
  result => console.log(result),
  err => {
    console.error(err);
    process.exit(1);
  },
);

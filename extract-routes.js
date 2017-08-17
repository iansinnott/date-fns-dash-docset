#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { flatten, map, pipe, trim } = require('ramda');
const cheerio = require('cheerio');

const { fromReadableStream } = require('./utils.js');

const toJSON = x => JSON.stringify(x, null, 2);

const getLinks = (html) => {
  const $ = cheerio.load(html);

  const links = $('.docs_finder-list > a')
    .map((_, el) => $(el).attr('href'))
    .toArray();

  return links;
};

const main = pipe(
  fromReadableStream,
  map(trim),
  map(getLinks),
  x => x.toArray(),
  map(pipe(flatten, toJSON))
);

main(process.stdin).subscribe(
  result => console.log(result),
  err => {
    console.error(err);
    process.exit(1);
  },
);

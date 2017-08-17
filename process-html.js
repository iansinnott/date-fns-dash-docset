#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const ramda = require('ramda');
const cheerio = require('cheerio');

main(process.stdin);

#!/usr/bin/env node

const { loadURL, isDebugging } = require('./utils.js');

const main = async () => {
  const result = await loadURL('https://date-fns.org/docs/Getting-Started', true);

  if (isDebugging()) {
    console.log('Fetched page source:', result);
  }

  console.log(result);
};

main();

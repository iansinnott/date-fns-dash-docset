const http = require('http');
const express = require('express');
const fs = require('fs');
const path = require('path');

/**
 * This file will server static assets from the assets directory but for
 * everything else will load the index file located at the path provded in the
 * first arg.
 */

const app = express();

const indexPath = path.resolve(process.argv[2]);

app.use('/assets', express.static('tmp/date-fns.org/assets'));

app.get('*', (req, res) => {
  const resBody = fs.createReadStream(indexPath);
  resBody.pipe(res);
});

const server = http.createServer(app);

const PORT = process.env.PORT || 3111;

server.listen(PORT, () => {
  console.log(`SPA server listening at http://localhost:${PORT}`);
  console.log(`Index file is ${indexPath}`);
  console.log();
});

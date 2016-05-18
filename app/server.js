'use strict';
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();

const path = require('path');
const PORT = normalizePort(process.env.PORT || '3000');

function normalizePort(val) {
  let port = parseInt(val, 10);
  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
}

function setupExpress(cb) {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(cookieParser());
  app.use('/public', express.static(path.join(__dirname, 'public')));

  app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/public/index.html'));
  });

  let server = http.createServer(app);
  server.listen(PORT, function() {
    console.log('listening on *:' + PORT);
  });

  // server.on('error', onError);

  server.on('listening', function() {
    var addr = server.address();
    var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    console.log('Listening on ' + bind);
    if (cb) {
      cb(app);
    }
  });

  return server;
};

module.exports = {
  setupExpress: setupExpress,
  PORT: PORT
};

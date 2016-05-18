'use strict';
const electron = require('electron');
const desktop = electron.app;
const server = require('./server');

const Path = require('path');
const Fs = require('fs');
const webby = require('webbybot');

var mainWindow = null;
var webServer;

// integrate with webbybot
require('dotenv').config({path: Path.join(__dirname, '.env')});
var adapter = process.env.HUBOT_ADAPTER || 'shell';
var alias = process.env.HUBOT_ALIAS || false;
var enableHttpd = process.env.HUBOT_HTTPD || true;
var name = process.env.HUBOT_NAME || 'webby';
var robot = webby.loadBot(null, adapter, enableHttpd, name, alias);
var externalScripts = Path.resolve(__dirname, 'external-scripts.json');
if (Fs.existsSync(externalScripts)) {
  Fs.readFile(externalScripts, function(err, data) {
    if (data.length > 0) {
      let scripts;
      try {
        scripts = JSON.parse(data);
      } catch (error) {
        robot.logger.error(
          'Error parsing JSON data from external-scripts.json: ' + error);
        process.exit(1);
      }
      robot.loadExternalScripts(scripts);
    }
  });
} else {
  robot.logger.debug('cannot find external-scripts.json');
}

desktop.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    desktop.quit();
  }
});

desktop.on('ready', function() {
  if (!mainWindow) {
    mainWindow = createMainWindow();

    webServer = server.setupExpress(function(app) {
      // setup webby router
      robot.router = app;
      mainWindow.loadURL('http://127.0.0.1:' + server.PORT);
      //comment this out when production
      mainWindow.toggleDevTools();
    });
  }
});

function createMainWindow() {
  const win = new electron.BrowserWindow({
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false
    },
    width: 600,
    height: 400
  });

	// win.loadURL(`file://${__dirname}/index.html`);
  win.on('closed', onClosed);
  return win;
}

function onClosed() {
	// dereference the window
  // for multiple windows store them in an array
  mainWindow = null;
  // close web server
  webServer.close();
}

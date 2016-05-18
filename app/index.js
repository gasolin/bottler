'use strict';
const electron = require('electron');
const desktop = electron.app;
const server = require('./server');
const webby = require('webbybot');
const Path = require('path');

var mainWindow = null;
var webServer;

require('dotenv').config({path: Path.join(__dirname, '.env')});
var adapter = process.env.HUBOT_ADAPTER || 'shell';
var alias = process.env.HUBOT_ALIAS || false;
var enableHttpd = process.env.HUBOT_HTTPD || true;
var name = process.env.HUBOT_NAME || 'webby';
var robot = webby.loadBot(null, adapter, enableHttpd, name, alias);

desktop.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    desktop.quit();
  }
});

desktop.on('ready', function() {
  if (!mainWindow) {
    mainWindow = createMainWindow();

    webServer = server.setupExpress(function(app) {
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

var app = require('app');

var server = require('./server.js');

var BrowserWindow = require('browser-window'); 

require('crash-reporter').start();

var mainWindow = null;

app.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

var numReady = 0;
var ready = function(){
	if(++numReady < 2) return;
	mainWindow = new BrowserWindow({width: 800, height: 600, "node-integration": false});

  mainWindow.loadUrl('http://localhost:3000/');

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
}

app.on('ready', ready);
server.on('ready', ready)

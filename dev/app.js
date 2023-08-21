const path = require('path');
const App = require('../app');//'vhp-electron-app');
const settings = require('./settings.json');
const config = require('./config.json');

//config.controls.root = path.join(__dirname,config.controls.root);

let prog = new App({
  appname:config.app,
  settings:settings,
  access:config.access,
  controls:config.controls,
  mart:config.mart
});





const path = require('path');
const App = require('../app');//'vhp-electron-app');
const settings = require('./settings.json');
const config = require('./config.json');

config.controls.root = path.join(__dirname,config.controls.root);

let prog = new App({
  appname:config.app,
  settings:settings,
  access:config.access,
  controls:config.controls,
  mart:config.mart
});

let routes = {
  /**
   * Returns a price key by version.
   * if a version is not passed, the newest
   * version is returned
   * 
   * 
   * @param {*} eve 
   * @param {String} data -> version
   */
  getPriceKey:(eve,data)=>{

    prog.mart.ROUTEstore({
      store:'pricekey',
      pack:{
        method:'QUERY',
        options:{query:{version:data}}
      }
    })
  },

  createQuote:(eve,data)=>{
    
  }
}





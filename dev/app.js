const path = require('path');
const App = require('../app');//'vhp-electron-app');
const settings = require('./settings.json');
const config = require('./config.json');

config.controls.root = path.join(__dirname,'./controls/')
let prog = new App({
  appname:config.app,
  settings:settings,
  access:config.access,
  controls:config.controls,
  mart:config.mart
});

/* LANDING PAGE
    The landing page will more often be the login screen
    This login screen can be skipped by editing the
    appset.dev.on = true. This will default to main.html
    If the developer wants to skip to a page, the
    appset.dev.page = '' can have a desired page file
    name

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready',prog.ready);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    prog.startView();
  }
});

*/

/*
  routes:{
    'GOTOpresi':(eve,data)=>{
      let answr = appproc.GOTOpresentation(eve,data);
      if(answr.load){
        viewtools.loader(controlsroot + 'presentation.html',stdwidth,stdheight,false,false,'hidden');
      }
      eve.sender.send(navroutes.gotopresi,answr);
    }
  }
ipcMain.on(navroutes.gotopresi,(eve,data)=>{
  let answr = appproc.GOTOpresentation(eve,data);
  if(answr.load){
    viewtools.loader(controlsroot + 'presentation.html',stdwidth,stdheight,false,false,'hidden');
  }
  eve.sender.send(navroutes.gotopresi,answr);
});

ipcMain.on(quoteroutes.refreshquotekey,(eve,data)=>{eve.sender.send(quoteroutes.refreshquotekey,appproc.GETkey(eve,data));});
ipcMain.on(settingsroutes.createkey,(eve,data)=>{eve.sender.send(settingsroutes.createkey,appproc.CREATEkey(eve,data));});

ipcMain.on(dashroutes.createquote,(eve,data)=>{appproc.CREATEquote(eve,data).then(answr=>{
  eve.sender(dashroutes.createquote,answr);
})});
ipcMain.on(quoteroutes.savequote,(eve,data)=>{appproc.SAVEquote(eve,data).then(answr=>{
  eve.sender(quoteroutes.savequote,answr);
})});
ipcMain.on(quoteroutes.deletequote,(eve,data)=>{appproc.DELETEquote(eve,data).then(answr=>{
  eve.sender(quoteroutes.deletequote,answr);
})});
ipcMain.on(dashroutes.getquote,(eve,data)=>{appproc.FINDquote(eve,data).then(answr=>{
  eve.sender.send(dashroutes.getquote,answr);
})});
ipcMain.on(dashroutes.loadquote,(eve,data)=>{
  answr = appproc.LOADquote(eve,data);
  viewtools.loader(controlsroot+'quoter.html',stdwidth,stdheight,false,false,'hidden');
  eve.sender.send(dashroutes.loadquote,answr);
});

getuserquote(eve,data)ipcMain.on(dashroutes.getuserquotes,(eve,data)=>{appproc.GETuserquotes(eve,data).then(answr=>{
    eve.sender.send(dashroutes.getuserquotes,answr);
})});
ipcMain.on(quoteroutes.syncquotesmaster,(eve,data)=>{appproc.SYNCquotes(eve,data).then(answr=>{
    eve.sender.send(quoteroutes.syncquotesmaster,answr);
})});

ipcMain.on(quoteroutes.createcontract,(eve,data)=>{appproc.CREATEcontract(eve,data).then(answr=>{
    eve.sender.send(quoteroutes.createcontract,answr);
})});

ipcMain.on(quoteroutes.createpresentation,(eve,data)=>{eve.sender.send(quoteroutes.createpresentation,appproc.CREATEpresentation(eve,data));});

ipcMain.on(quoteroutes.sellquote,(eve,data)=>{appproc.SELLquote(eve,data).then(answr=>{
    eve.sender.send(quoteroutes.sellquote,answr);
})});
*/
/*  Routes
    File holds all the route names for communication
    between ipcMain and ipcRenderer.

    routes can be add and organized as needed with
    in the module.expoerts = {}
*/
var settingsroutes = {
  createkey:'CREATE-pricekey',
  save:'POST-settings'
}

var quoteroutes = {
  savequote:'POST-savequote',
  deletequote:'POST-deletequote',
  syncquotesmaster:'POST-synctomaster',
  refreshquotekey:'GET-refreshquotekey',
  createpresentation:'POST-createpresentation',
  createcontract:'POST-createcontract',
  sellquote:'POST-sellquote'
}

var qdashroutes = {
  getquote:'GET-aquote',
  getuserquotes:'GET-userquotes',
  createquote:'POST-createquote',
  loadquote:'GET-loadquote',
  syncquotesmaster:'POST-synctomaster'
}

var navroutes = {
  gotologin:'goto-login',
  getadmin: 'GET-admin',
  gotometrics: 'GOTO-metrics',
  gotoVHCdash: 'GOTO-VHC-dash',
  gotoBEEdash: 'GOTO-BEE-dash',
  gotosettings:'GOTO-settings',
  gotopresi:'GOTO-RRQ-presentation',
  gotoboard:'GOTO-RRQ-board'
}




module.exports = {
  navroutes,
  settingsroutes,
  qdashroutes,
  quoteroutes
}

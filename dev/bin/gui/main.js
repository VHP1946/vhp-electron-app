const $ = require('jquery'),
    path = require('path');

var {navroutes,loginroutes,qdashroutes,quoteroutes} = require('../bin/routes.js'); //Routes to Main Process

var {ipcRenderer}=require('electron');

ipcRenderer.send('GOTO',{page:'login/',action:'logout'});
ipcRenderer.on('GOTO',(eve,data)=>{
    console.log('GOTO >',data);
})
//test GET-settings data:{section:<settings section name>}
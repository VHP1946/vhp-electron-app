const $ = require('jquery'),
    path = require('path');

var {ipcRenderer}=require('electron');


ipcRenderer.on('page-close',(eve,data)=>{
    console.log('close was clicked');
})
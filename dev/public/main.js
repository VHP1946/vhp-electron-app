const $ = require('jquery'),
    path = require('path');

var {ipcRenderer}=require('electron');


ipcRenderer.invoke('GOTO',{
    page:'test'
});
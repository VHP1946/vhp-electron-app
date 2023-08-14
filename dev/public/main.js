const $ = require('jquery'),
    path = require('path');

var {ipcRenderer}=require('electron');


ipcRenderer.invoke('GOTO',{
    view:true,
    page:'http://18.191.223.80/RRTracker',
    url:true
})
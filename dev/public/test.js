const $ = require('jquery'),
    path = require('path');

var {ipcRenderer}=require('electron');

document.getElementById('test').addEventListener('click',(eve)=>{
    ipcRenderer.invoke('home',{}); 
})
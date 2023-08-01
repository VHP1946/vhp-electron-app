const $ = require('jquery'),
    path = require('path');

var {ipcRenderer}=require('electron');

ipcRenderer.invoke('store',{
    store:'quotes',
    pack:{
        method:'QUERY',
        options:{query:{estimator:'MURRY'}}
    }
}).then(result=>{console.log(result)})
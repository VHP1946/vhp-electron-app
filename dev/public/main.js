const $ = require('jquery'),
    path = require('path');

var {ipcRenderer}=require('electron');


let route = 'store';
ipcRenderer.send(route,{
    store:'quotes',
    pack:{
        method:'QUERY',
        options:{query:{estimator:'VOGGR'}}
    }
});
ipcRenderer.on(route,(eve,data)=>{
    console.log(route,data);
})
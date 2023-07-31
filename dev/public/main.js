const $ = require('jquery'),
    path = require('path');

var {ipcRenderer}=require('electron');


let route = 'store';

ipcRenderer.send(route,{
    store:'quotes',
    pack:{
        method:'QUERY',
        options:{query:{}}
    }
});
ipcRenderer.on(route,(eve,data)=>{
    if(data){
        //empty
    }
    console.log(route,data);
})
const $ = require('jquery'),
    path = require('path');

var {ipcRenderer}=require('electron');


let route = 'openFolder';
ipcRenderer.send(route,{
    drive:'cdrive'
});
ipcRenderer.on(route,(eve,data)=>{
    if(data){
        //empty
    }
    console.log(route,data);
})
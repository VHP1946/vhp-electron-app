const $ = require('jquery'),
    path = require('path');

var {ipcRenderer}=require('electron');


let route = 'jsonTOexcel';
ipcRenderer.send(route,{
    drive:'cdrive',
    epath:'/dev/test.xlsx',
    data:[{test:3}],
    open:true
});
ipcRenderer.on(route,(eve,data)=>{
    console.log(route,data);
})
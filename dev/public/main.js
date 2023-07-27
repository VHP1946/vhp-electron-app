const $ = require('jquery'),
    path = require('path');

var {ipcRenderer}=require('electron');


let route = 'authUser';
ipcRenderer.send(route,{
    uname:'VOGCH',
    pswrd:''
});
ipcRenderer.on(route,(eve,data)=>{
    if(data){
        //empty
    }
    console.log(route,data);
})